import type { ExerciseItem } from '../types'
import { fractionsEqual } from './fraction'

/** Answer shape typed by the student for one item; fields unused by a given item type are ignored. */
export interface AnswerInput {
  value?: string
  quotient?: string
  remainder?: string
  num?: string
  den?: string
  values?: string[]
}

type MissingNumbers = Extract<ExerciseItem, { type: 'missingNumbers' }>

/** Missing-index positions, left-to-right, regardless of the order they were authored in. */
export function orderedMissingIndices(item: MissingNumbers): number[] {
  return [...item.missingIndices].sort((a, b) => a - b)
}

const toNumber = (s: string | undefined): number | null => {
  if (s === undefined || s.trim() === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isNaN(n) ? null : n
}

export function isAnswerComplete(item: ExerciseItem, answer: AnswerInput): boolean {
  switch (item.type) {
    case 'euclidianDivision':
      return toNumber(answer.quotient) != null && toNumber(answer.remainder) != null
    case 'fractionAddition':
    case 'fractionSubtraction':
      return toNumber(answer.num) != null && toNumber(answer.den) != null
    case 'missingNumbers':
      return orderedMissingIndices(item).every((_, i) => toNumber(answer.values?.[i]) != null)
    case 'discoverNumber':
      return true // display-only, nothing for the student to answer
    default:
      return toNumber(answer.value) != null
  }
}

export function checkAnswer(item: ExerciseItem, answer: AnswerInput): boolean {
  switch (item.type) {
    case 'euclidianDivision': {
      const q = toNumber(answer.quotient)
      const r = toNumber(answer.remainder)
      return q === item.quotient && r === item.remainder
    }
    case 'fractionAddition':
    case 'fractionSubtraction': {
      const num = toNumber(answer.num)
      const den = toNumber(answer.den)
      if (num == null || den == null || den === 0) return false
      return fractionsEqual({ num, den }, item.result)
    }
    case 'missingNumbers':
      return orderedMissingIndices(item).every((idx, i) => toNumber(answer.values?.[i]) === item.start + idx)
    case 'discoverNumber':
      return true // display-only, always counts as correct
    default: {
      const value = toNumber(answer.value)
      if (value == null) return false
      return Math.abs(value - item.result) < 1e-9
    }
  }
}
