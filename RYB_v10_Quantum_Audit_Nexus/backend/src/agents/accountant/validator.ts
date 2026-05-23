export interface PayrollInput {
  employeeName: string;
  fiscalCode: string;
  month: number;
  year: number;
  grossSalary: number;
  netSalary?: number;
  inpsContribution?: number;
  inailContribution?: number;
  irpefWithheld?: number;
  tfrAccrued?: number;
  ccnlCode?: string;
  level?: string;
  hoursWorked?: number;
  overtimeHours?: number;
  overtimePay?: number;
}

export interface ValidationAnomaly {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  field: string;
  expected: string | number;
  actual: string | number;
  description: string;
  legalReference?: string;
}

export interface ValidationResult {
  isValid: boolean;
  anomalies: ValidationAnomaly[];
  calculatedFields: Record<string, number>;
  confidence: number;
}

export class PayrollValidator {
  private ccnlDB: Map<string, any>;

  constructor() {
    this.ccnlDB = new Map();
    this.loadCCNLData();
  }

  private loadCCNLData() {
    // CCNL principali precaricati (v10 ha 50+ CCNL)
    const ccnls = [
      { code: 'COMmercio', levels: { '1': 1200, '2': 1400, '3': 1600, '4': 1800, '5': 2000 } },
      { code: 'METALmeccanici', levels: { '1': 1300, '2': 1500, '3': 1700, '4': 1900, '5': 2100, '6': 2300, '7': 2500 } },
      { code: 'TURismo', levels: { 'A': 1100, 'B': 1300, 'C': 1500, 'D': 1700 } },
    ];

    for (const ccnl of ccnls) {
      this.ccnlDB.set(ccnl.code.toLowerCase(), ccnl);
    }
  }

  validate(payroll: PayrollInput): ValidationResult {
    const anomalies: ValidationAnomaly[] = [];
    const calculated: Record<string, number> = {};

    // 1. Verifica minimi retributivi
    if (payroll.ccnlCode && payroll.level) {
      const ccnl = this.ccnlDB.get(payroll.ccnlCode.toLowerCase());
      const minWage = ccnl?.levels[payroll.level];
      if (minWage && payroll.grossSalary < minWage) {
        anomalies.push({
          severity: 'CRITICAL',
          field: 'grossSalary',
          expected: minWage,
          actual: payroll.grossSalary,
          description: `Retribuzione lorda €${payroll.grossSalary} inferiore al minimo CCNL ${payroll.ccnlCode} livello ${payroll.level} (€${minWage})`,
          legalReference: 'Art. 36 Cost. - CCNL applicato'
        });
      }
    }

    // 2. Calcolo INPS
    const inpsRate = this.getInpsRate(payroll.year);
    const expectedInps = payroll.grossSalary * inpsRate;
    calculated['inpsExpected'] = Math.round(expectedInps * 100) / 100;

    if (payroll.inpsContribution !== undefined) {
      const diff = Math.abs(payroll.inpsContribution - expectedInps);
      if (diff > expectedInps * 0.03) {
        anomalies.push({
          severity: diff > expectedInps * 0.08 ? 'CRITICAL' : 'WARNING',
          field: 'inpsContribution',
          expected: calculated['inpsExpected'],
          actual: payroll.inpsContribution,
          description: `Contributi INPS discordanza: €${diff.toFixed(2)}`,
          legalReference: `D.Lgs. 463/1983 - Aliquota INPS ${payroll.year}: ${(inpsRate * 100).toFixed(2)}%`
        });
      }
    }

    // 3. Verifica INAIL
    if (payroll.inailContribution === 0 || payroll.inailContribution === undefined) {
      anomalies.push({
        severity: 'WARNING',
        field: 'inailContribution',
        expected: 'Presente',
        actual: 'Assente',
        description: 'Contributo INAIL non rilevato — verificare esclusione legittima',
        legalReference: 'D.P.R. 1124/1965'
      });
    }

    // 4. IRPEF
    const taxableIncome = payroll.grossSalary - (payroll.inpsContribution || expectedInps);
    const expectedIrpef = this.calculateIrpef(taxableIncome);
    calculated['irpefExpected'] = Math.round(expectedIrpef * 100) / 100;

    if (payroll.irpefWithheld !== undefined) {
      const irpefDiff = Math.abs(payroll.irpefWithheld - expectedIrpef);
      if (irpefDiff > 100) {
        anomalies.push({
          severity: 'INFO',
          field: 'irpefWithheld',
          expected: calculated['irpefExpected'],
          actual: payroll.irpefWithheld,
          description: `IRPEF differisce di €${irpefDiff.toFixed(2)} — verificare detrazioni familiari/figli`
        });
      }
    }

    // 5. TFR
    const tfrBase = taxableIncome / 13.5;
    const revalCoeff = this.getTfrCoefficient(payroll.year, payroll.month);
    const expectedTfr = tfrBase * revalCoeff;
    calculated['tfrExpected'] = Math.round(expectedTfr * 100) / 100;

    if (payroll.tfrAccrued !== undefined) {
      if (Math.abs(payroll.tfrAccrued - expectedTfr) > 10) {
        anomalies.push({
          severity: 'WARNING',
          field: 'tfrAccrued',
          expected: calculated['tfrExpected'],
          actual: payroll.tfrAccrued,
          description: 'TFR maturato non coerente con calcolo standard (Lordo - INPS) / 13.5 × coeff. rivalutazione',
          legalReference: 'Art. 2120 c.c. - D.M. TFR'
        });
      }
    }

    // 6. Straordinari
    if (payroll.overtimeHours && payroll.overtimePay) {
      const hourlyRate = payroll.grossSalary / (payroll.hoursWorked || 168);
      const minOvertimeRate = hourlyRate * 1.25;
      const actualRate = payroll.overtimePay / payroll.overtimeHours;

      if (actualRate < minOvertimeRate * 0.95) {
        anomalies.push({
          severity: 'CRITICAL',
          field: 'overtimePay',
          expected: `≥ €${(minOvertimeRate * payroll.overtimeHours).toFixed(2)}`,
          actual: `€${payroll.overtimePay.toFixed(2)}`,
          description: `Retribuzione straordinaria €${actualRate.toFixed(2)}/h inferiore al minimo legale (+25%)`,
          legalReference: 'Art. 5 D.Lgs. 66/2003 - Lgs. 8/2000'
        });
      }
    }

    return {
      isValid: !anomalies.some(a => a.severity === 'CRITICAL'),
      anomalies,
      calculatedFields: calculated,
      confidence: this.calculateConfidence(anomalies, payroll)
    };
  }

  private getInpsRate(year: number): number {
    const rates: Record<number, number> = {
      2020: 0.0919, 2021: 0.0919, 2022: 0.0919,
      2023: 0.0919, 2024: 0.0919, 2025: 0.0919, 2026: 0.0919
    };
    return rates[year] || 0.0919;
  }

  private calculateIrpef(income: number): number {
    if (income <= 15000) return income * 0.23;
    if (income <= 28000) return 3450 + (income - 15000) * 0.25;
    if (income <= 50000) return 6700 + (income - 28000) * 0.35;
    return 14400 + (income - 50000) * 0.43;
  }

  private getTfrCoefficient(year: number, month: number): number {
    // Coefficienti ISTAT semplificati
    const base = 1.5 + (year - 2020) * 0.1;
    return 1 + (base * month / 1200);
  }

  private calculateConfidence(anomalies: ValidationAnomaly[], payroll: PayrollInput): number {
    let score = 100;
    score -= anomalies.filter(a => a.severity === 'CRITICAL').length * 30;
    score -= anomalies.filter(a => a.severity === 'WARNING').length * 10;
    score -= anomalies.filter(a => a.severity === 'INFO').length * 2;

    // Penalità se mancano dati fondamentali
    if (!payroll.ccnlCode) score -= 15;
    if (!payroll.hoursWorked) score -= 10;

    return Math.max(0, score);
  }
}