// v10: Predictive Audit ML
// Uses simple statistical models to predict next payroll anomalies

export interface PayrollTrend {
  slope: number;
  intercept: number;
  r2: number;
  forecast: number[];
}

export function analyzeTrend(values: number[]): PayrollTrend {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0, forecast: [] };

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * values[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  const ssTotal = values.reduce((s, y) => s + Math.pow(y - yMean, 2), 0);
  const ssResidual = values.reduce((s, y, i) => s + Math.pow(y - (intercept + slope * i), 2), 0);
  const r2 = 1 - (ssResidual / ssTotal);

  // Forecast next 3 periods
  const forecast = [1, 2, 3].map(i => intercept + slope * (n + i - 1));

  return { slope, intercept, r2, forecast };
}

export function detectOutlier(value: number, trend: PayrollTrend): boolean {
  const expected = trend.intercept + trend.slope * (trend.forecast.length + 2);
  const stdDev = Math.sqrt(trend.r2 > 0 ? 1 : 1000); // Simplified
  return Math.abs(value - expected) > 2 * stdDev;
}