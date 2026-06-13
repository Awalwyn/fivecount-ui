export function formatScore(score: number | undefined | null): string {
  if (score === null || score === undefined) {
    return '—';
  }

  // Cap at 17.50 (max gymnastics score), floor at 0.00
  const capped = Math.min(Math.max(score, 0), 17.5);

  // Format to 2 decimals with trailing zeros
  return capped.toFixed(2);
}
