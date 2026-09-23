import type { Score } from '../types'

/**
 * Accuracy bands per spec: <75% right -> 0, 75% -> 1, 85% -> 2, 95% -> 3,
 * and at 95%+ the time under 8min bumps to 4, under 6min bumps to 5.
 */
export function computeScore(correct: number, total: number, elapsedMs: number): Score {
  const accuracy = total === 0 ? 0 : correct / total
  const minutes = elapsedMs / 60000

  if (accuracy < 0.75) return 0
  if (accuracy < 0.85) return 1
  if (accuracy < 0.95) return 2
  if (minutes < 6) return 5
  if (minutes < 8) return 4
  return 3
}
