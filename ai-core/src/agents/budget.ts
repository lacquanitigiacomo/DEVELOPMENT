export const budgetAgent = {
  async optimize(history: any[], goals: { targetSavings: number; months: number }) {
    const avgMonthly = history.reduce((s, h) => s + h.total, 0) / history.length;
    const neededSavings = goals.targetSavings / goals.months;
    const recommendedBudget = avgMonthly - neededSavings;

    return {
      currentAverage: Math.round(avgMonthly * 100) / 100,
      targetMonthlySavings: Math.round(neededSavings * 100) / 100,
      recommendedBudget: Math.round(recommendedBudget * 100) / 100,
      feasibility: recommendedBudget > 0 ? 'achievable' : 'tight',
      tips: [
        'Imposta un trasferimento automatico al salvadanaio il giorno dello stipendio',
        'Usa la regola 50/30/20: 50% necessità, 30% svago, 20% risparmio',
        'Traccia ogni spesa per almeno 30 giorni per identificare pattern',
      ],
    };
  },
};
