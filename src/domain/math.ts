export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function weightedAverage(values: Array<{ value: number; weight: number }>): number {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  return values.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
}
