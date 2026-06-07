export interface ForecastPoint {
  date: string;
  value: number;
}

export function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  
  const smoothed: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

export function forecastProduction(
  historicalData: ForecastPoint[],
  daysToForecast: number = 7
): ForecastPoint[] {
  if (historicalData.length === 0) return [];

  const values = historicalData.map(d => d.value);
  const smoothed = exponentialSmoothing(values, 0.4);

  const regressionData = smoothed.map((y, i) => ({ x: i, y }));
  const { slope, intercept } = linearRegression(regressionData);

  const forecast: ForecastPoint[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const lastSmoothedValue = smoothed[smoothed.length - 1];

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    const trendValue = intercept + slope * (historicalData.length + i - 1);
    
    const decayFactor = Math.exp(-i * 0.05);
    const randomVariation = (Math.random() - 0.5) * lastSmoothedValue * 0.08 * decayFactor;
    
    const forecastValue = Math.max(5, trendValue * 0.7 + lastSmoothedValue * 0.3 + randomVariation);

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      value: forecastValue,
    });
  }

  return forecast;
}

export function calculateProductionTrend(historicalData: ForecastPoint[]): 'increasing' | 'decreasing' | 'stable' {
  if (historicalData.length < 7) return 'stable';

  const recentValues = historicalData.slice(-7).map(d => d.value);
  const olderValues = historicalData.slice(-14, -7).map(d => d.value);

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (changePercent > 3) return 'increasing';
  if (changePercent < -3) return 'decreasing';
  return 'stable';
}
