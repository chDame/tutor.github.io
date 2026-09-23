import type { ManifestExerciseEntry, Score, TopicManifest } from '../types'

export interface FlatExercise extends ManifestExerciseEntry {
  levelSlug: string
  levelTitle: string
  levelIndex: number
  indexInLevel: number
  globalIndex: number
}

export interface ExerciseState extends FlatExercise {
  score: Score | null
  completed: boolean
  unlocked: boolean
  isNextValidation: boolean
}

export function flattenManifest(manifest: TopicManifest): FlatExercise[] {
  const flat: FlatExercise[] = []
  manifest.levels.forEach((level, levelIndex) => {
    level.exercises.forEach((exercise, indexInLevel) => {
      flat.push({
        ...exercise,
        levelSlug: level.slug,
        levelTitle: level.title,
        levelIndex,
        indexInLevel,
        globalIndex: flat.length,
        character: exercise.character ?? null,
      })
    })
  })
  return flat
}

/**
 * At any time only two nodes are attemptable if not yet completed: the next
 * exercise right after the last one completed, and the next validation
 * ahead of it (a shortcut that, if passed with score >= 4, skips everything
 * in between). Failing a validation does not advance past it.
 */
export function computeExerciseStates(flat: FlatExercise[], scores: Record<string, Score>): ExerciseState[] {
  let reached = 0
  for (let i = 0; i < flat.length; i++) {
    const score = scores[flat[i].id]
    if (score == null) continue
    if (flat[i].evaluation) {
      if (score >= 4) reached = Math.max(reached, i + 1)
    } else {
      reached = Math.max(reached, i + 1)
    }
  }

  const nextValidationIndex = flat.findIndex((ex, i) => i >= reached && ex.evaluation && scores[ex.id] >3 )

  return flat.map((ex, i) => {
    const score = scores[ex.id] ?? null
    const completed = score != null
    const isNextValidation = i === nextValidationIndex
    const unlocked = completed || i === reached || isNextValidation
    return { ...ex, score, completed, unlocked, isNextValidation }
  })
}
