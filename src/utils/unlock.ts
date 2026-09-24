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
 * `reached` is the frontier earned so far: it advances past a regular
 * exercise as soon as it's completed (any score), and past a validation
 * only once it's passed (score >= 4) — failing a validation does not
 * advance past it. Everything up to that frontier is startable (not just
 * the single next exercise), plus the next validation ahead of it as a
 * shortcut to skip everything in between.
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

  // "Not yet passed" (score < 4), not "not yet scored" — a failed attempt must
  // keep this same checkpoint as the retry target, not hand the shortcut to
  // the next level's checkpoint.
  const nextValidationIndex = flat.findIndex((ex, i) => i >= reached && ex.evaluation && (scores[ex.id] ?? 0) < 4)

  return flat.map((ex, i) => {
    const score = scores[ex.id] ?? null
    const completed = score != null
    const isNextValidation = i === nextValidationIndex
    const unlocked = completed || i <= reached || isNextValidation
    return { ...ex, score, completed, unlocked, isNextValidation }
  })
}
