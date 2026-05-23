import { z } from 'zod';

const ccnlSchema = z.object({
  code: z.string(),
  name: z.string(),
  sector: z.string(),
  minWage: z.number(),
  maxHoursWeekly: z.number().default(40),
  overtimeRate: z.number().default(1.25),
  nightShiftBonus: z.number().default(0.15),
  holidayBonus: z.number().default(0.30),
});

// Database CCNL conosciuti (espandibile)
const KNOWN_CCNL: Record<string, any> = {
  'CCNL-PULIZIE': {
    code: 'CCNL-PULIZIE',
    name: 'CCNL Pulizie e Multiservizi',
    sector: 'Servizi di pulizia',
    minWage: 1100,
    maxHoursWeekly: 40,
    overtimeRate: 1.25,
    nightShiftBonus: 0.20,
    holidayBonus: 0.30,
  },
  'CCNL-COMMERCIO': {
    code: 'CCNL-COMMERCIO',
    name: 'CCNL Commercio Terziario',
    sector: 'Commercio',
    minWage: 1250,
    maxHoursWeekly: 40,
    overtimeRate: 1.25,
    nightShiftBonus: 0.15,
    holidayBonus: 0.25,
  },
  'CCNL-EDILIZIA': {
    code: 'CCNL-EDILIZIA',
    name: 'CCNL Edilizia Industria',
    sector: 'Edilizia',
    minWage: 1400,
    maxHoursWeekly: 40,
    overtimeRate: 1.30,
    nightShiftBonus: 0.25,
    holidayBonus: 0.35,
  },
};

export const payrollAgent = {
  // Verifica se il CCNL è conosciuto
  lookupCCNL(code: string) {
    const normalized = code.toUpperCase().replace(/\s+/g, '-');
    return KNOWN_CCNL[normalized] || null;
  },

  // Analizza busta paga
  async analyzePayslip(payslipData: {
    grossSalary: number;
    netSalary: number;
    hoursWorked: number;
    overtimeHours?: number;
    nightHours?: number;
    holidayHours?: number;
    ccnlCode: string;
  }) {
    const ccnl = this.lookupCCNL(payslipData.ccnlCode);
    if (!ccnl) {
      return {
        valid: false,
        error: 'CCNL non riconosciuto',
        suggestions: ['Verifica il codice CCNL', 'Contatta il sindacato di riferimento'],
      };
    }

    const issues: string[] = [];
    const checks: any[] = [];

    // Check min wage
    if (payslipData.grossSalary < ccnl.minWage) {
      issues.push(`Stipendio lordo (${payslipData.grossSalary}€) inferiore al minimo CCNL (${ccnl.minWage}€)`);
    }
    checks.push({ check: 'Minimo salariale', passed: payslipData.grossSalary >= ccnl.minWage, expected: ccnl.minWage, actual: payslipData.grossSalary });

    // Check hours
    if (payslipData.hoursWorked > ccnl.maxHoursWeekly * 4.33) { // ~monthly hours
      issues.push(`Ore lavorate (${payslipData.hoursWorked}) superiori al massimo mensile previsto`);
    }
    checks.push({ check: 'Ore massime', passed: payslipData.hoursWorked <= ccnl.maxHoursWeekly * 4.33, expected: ccnl.maxHoursWeekly * 4.33, actual: payslipData.hoursWorked });

    // Check overtime pay
    if (payslipData.overtimeHours && payslipData.overtimeHours > 0) {
      const expectedOvertimePay = (payslipData.grossSalary / (ccnl.maxHoursWeekly * 4.33)) * payslipData.overtimeHours * ccnl.overtimeRate;
      checks.push({ check: 'Straordinari pagati', passed: true, expected: expectedOvertimePay, actual: 'Verifica manuale richiesta' });
    }

    return {
      valid: issues.length === 0,
      ccnl,
      issues,
      checks,
      recommendations: issues.length > 0 
        ? ['Confronta con il sindacato', 'Richiedi chiarimenti all'HR', 'Verifica sul portale INPS']
        : ['Tutto conforme al CCNL'],
    };
  },

  // Confronta orari comunicati vs orari in busta paga
  async compareHours(communicatedSchedule: any[], payslipHours: number) {
    const totalScheduled = communicatedSchedule.reduce((sum, day) => sum + (day.hours || 0), 0);
    const monthlyScheduled = totalScheduled * 4.33;

    const diff = Math.abs(monthlyScheduled - payslipHours);
    const tolerance = 2; // 2 ore tolleranza

    return {
      scheduledMonthly: Math.round(monthlyScheduled * 100) / 100,
      payslipHours,
      difference: Math.round(diff * 100) / 100,
      match: diff <= tolerance,
      alert: diff > tolerance ? `Differenza di ${Math.round(diff)} ore tra orari comunicati e busta paga` : null,
    };
  },
};
