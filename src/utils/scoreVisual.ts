import type { Difficulty, Score } from '../types'

/** Scores 3-5 all mean "fully correct", so they all show the max 3 stars; the bonus icon carries the extra info. */
export function starsForScore(score: Score): number {
  return Math.min(score, 3)
}

export function bonusIcon(score: Score): string | null {
  if (score === 5) return '🚀'
  if (score === 4) return '🏎️'
  return null
}

/** No dedicated "pacifier" glyph in Unicode — baby bottle is the closest common stand-in for "easiest". */
export function difficultyIcon(difficulty: Difficulty): string | null {
  switch (difficulty) {
    case 0:
      return '👶'
    case 1:
      return '🍰'
    case 4:
      return '💀'
    case 5:
      return '💀'
    default:
      return null
  }
}
