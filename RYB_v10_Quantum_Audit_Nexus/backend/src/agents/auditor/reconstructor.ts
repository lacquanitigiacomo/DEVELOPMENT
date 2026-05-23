export interface TimeEntry {
  date: string;
  hoursWorked: number;
  isOvertime: boolean;
  dayOfWeek: number;
}

export interface WorkPattern {
  regularDays: number[];
  avgDailyHours: number;
  avgWeeklyHours: number;
  shiftType: 'fixed' | 'rotating' | 'flexible';
  confidence: number;
}

export interface ReconstructedEntry {
  date: string;
  hours: number;
  isReconstructed: true;
  confidence: number;
  patternUsed: string;
}

export class PatternReconstructor {

  analyzePattern(entries: TimeEntry[]): WorkPattern {
    if (entries.length === 0) {
      return { regularDays: [], avgDailyHours: 0, avgWeeklyHours: 0, shiftType: 'flexible', confidence: 0 };
    }

    const dayCounts = new Map<number, { count: number; hours: number[] }>();

    for (const entry of entries) {
      const existing = dayCounts.get(entry.dayOfWeek) || { count: 0, hours: [] };
      existing.count++;
      existing.hours.push(entry.hoursWorked);
      dayCounts.set(entry.dayOfWeek, existing);
    }

    const totalWeeks = Math.ceil(entries.length / 7);
    const regularDays: number[] = [];
    let totalHours = 0;
    let totalDays = 0;

    for (const [day, data] of dayCounts.entries()) {
      if (data.count / totalWeeks > 0.65) {
        regularDays.push(day);
      }
      totalHours += data.hours.reduce((a, b) => a + b, 0);
      totalDays += data.hours.length;
    }

    const avgDaily = totalDays > 0 ? totalHours / totalDays : 0;
    const avgWeekly = avgDaily * regularDays.length;

    // Detect shift type
    const allHours = Array.from(dayCounts.values()).flatMap(d => d.hours);
    const variance = this.variance(allHours);
    let shiftType: WorkPattern['shiftType'] = 'flexible';
    if (variance < 0.8) shiftType = 'fixed';
    else if (this.detectRotation(entries)) shiftType = 'rotating';

    return {
      regularDays: regularDays.sort((a, b) => a - b),
      avgDailyHours: Math.round(avgDaily * 100) / 100,
      avgWeeklyHours: Math.round(avgWeekly * 100) / 100,
      shiftType,
      confidence: Math.min(100, entries.length * 1.5 + (regularDays.length > 0 ? 20 : 0))
    };
  }

  reconstructCalendar(
    pattern: WorkPattern,
    missingMonths: Array<{ year: number; month: number }>,
    existingPayrolls?: Array<{ month: number; year: number; grossSalary: number }>
  ): ReconstructedEntry[] {
    const reconstructed: ReconstructedEntry[] = [];

    for (const { year, month } of missingMonths) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const matchingPayroll = existingPayrolls?.find(p => p.month === month && p.year === year);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dow = date.getDay();

        if (pattern.regularDays.includes(dow) && !this.isHoliday(date)) {
          reconstructed.push({
            date: date.toISOString().split('T')[0],
            hours: pattern.avgDailyHours,
            isReconstructed: true,
            confidence: Math.round(pattern.confidence * 0.7),
            patternUsed: `${pattern.shiftType} shift, days [${pattern.regularDays.join(',')}]`
          });
        }
      }

      // Cross-validate with payroll if available
      if (matchingPayroll) {
        const monthHours = reconstructed
          .filter(r => r.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
          .reduce((s, r) => s + r.hours, 0);

        const expectedHours = this.estimateHoursFromSalary(matchingPayroll.grossSalary);
        if (Math.abs(monthHours - expectedHours) > 24) {
          console.warn(`[RECONSTRUCTOR] Discordanza ${year}-${month}: ricostruito ${monthHours}h, atteso ~${expectedHours}h`);
        }
      }
    }

    return reconstructed;
  }

  private variance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
  }

  private detectRotation(entries: TimeEntry[]): boolean {
    const mid = Math.floor(entries.length / 2);
    const first = new Set(entries.slice(0, mid).map(e => e.dayOfWeek));
    const second = new Set(entries.slice(mid).map(e => e.dayOfWeek));
    const intersection = new Set([...first].filter(x => second.has(x)));
    return intersection.size / Math.max(first.size, second.size) < 0.7;
  }

  private isHoliday(date: Date): boolean {
    const fixed = [
      [1, 1], [1, 6], [4, 25], [5, 1], [6, 2],
      [8, 15], [11, 1], [12, 8], [12, 25], [12, 26]
    ];
    return fixed.some(([m, d]) => m === date.getMonth() + 1 && d === date.getDate());
  }

  private estimateHoursFromSalary(grossSalary: number): number {
    // Euristica: ~€12-15/h media
    return grossSalary / 13;
  }
}