import type { BeatTheClockConfig, ExerciseItem } from '../types'

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Builds one randomly-generated item for a spec's `type`, reusing the existing item shapes. */
function buildItem(type: ExerciseItem['type'], x: number, y: number): ExerciseItem {
  switch (type) {
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
    case 'relativeAddition':
    case 'relativeSubtraction':
    case 'decimalAddition':
    case 'decimalSubtraction':
      return { id: '', type, x, y }
    case 'missingOperand':
      return { id: '', type, x, y: null, operator: '+', result: x + y }
    default:
      throw new Error(`Beat the Clock: unsupported problem type "${type}"`)
  }
}

/** Generates a fresh, shuffled, one-item-per-page set of items for a round. */
export function generateBeatTheClockItems(config: BeatTheClockConfig): ExerciseItem[] {
  const items: ExerciseItem[] = []
  for (const spec of config.problems) {
    for (let i = 0; i < spec.count; i++) {
      const x = randInt(spec.xRange[0], spec.xRange[1])
      const y = randInt(spec.yRange[0], spec.yRange[1])
      items.push(buildItem(spec.type, x, y))
    }
  }
  return shuffle(items)
}

export type Medal = 'gold' | 'silver' | 'bronze' | null

export function computeMedal(elapsedSeconds: number, times: BeatTheClockConfig['times']): Medal {
  if (elapsedSeconds <= times[0]) return 'gold'
  if (elapsedSeconds <= times[1]) return 'silver'
  if (elapsedSeconds <= times[2]) return 'bronze'
  return null
}
