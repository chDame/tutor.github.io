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

type SimpleOperation = Extract<
  ExerciseItem,
  { type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'relativeAddition' | 'relativeSubtraction' | 'decimalAddition' | 'decimalSubtraction' }
>

/** No stored answer key for these — always derived from x/y, so content only ever supplies operands. */
export function expectedSimpleResult(item: SimpleOperation): number {
  switch (item.type) {
    case 'addition':
    case 'relativeAddition':
      return item.x + item.y
    case 'subtraction':
    case 'relativeSubtraction':
      return item.x - item.y
    case 'multiplication':
      return item.x * item.y
    case 'division':
      return item.x / item.y
    case 'decimalAddition':
      return Math.round((item.x + item.y) * 10) / 10
    case 'decimalSubtraction':
      return Math.round((item.x - item.y) * 10) / 10
  }
}

export type ColumnOperation = Extract<ExerciseItem, { type: 'columnAddition' | 'columnSubtraction' | 'columnMultiplication' }>

/** No stored answer key for these either — derived from the operands. */
export function expectedColumnResult(item: ColumnOperation): number {
  switch (item.type) {
    case 'columnAddition':
      return item.operands.reduce((a, b) => a + b, 0)
    case 'columnSubtraction':
      return item.operands.reduce((a, b) => a - b)
    case 'columnMultiplication':
      return item.operands.reduce((a, b) => a * b, 1)
  }
}

type MissingOperand = Extract<ExerciseItem, { type: 'missingOperand' }>

/**
 * Exactly one of x/y is null in content; derives that missing value from the
 * other operand, the operator, and the shown result. For '%' the inverse
 * isn't unique in general, so this picks the canonical smallest valid answer
 * (matches simple textbook problems like "12 % ? = 4" -> 8).
 */
export function solveMissingOperand(item: MissingOperand): number {
  const { x, operator, y, result } = item
  if (y == null) {
    switch (operator) {
      case '+':
        return result - x!
      case '-':
        return x! - result
      case '×':
        return result / x!
      case '÷':
        return x! / result
      case '%': {
        const target = x! - result
        if (target === 0) return result + 1
        for (let candidate = result + 1; candidate <= target; candidate++) {
          if (target % candidate === 0) return candidate
        }
        return NaN
      }
    }
  }
  switch (operator) {
    case '+':
      return result - y!
    case '-':
      return result + y!
    case '×':
      return result / y!
    case '÷':
      return result * y!
    case '%':
      return result // smallest non-negative x satisfying x % y === result
  }
}

const toNumber = (s: string | undefined): number | null => {
  if (s === undefined || s.trim() === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isNaN(n) ? null : n
}

const normalizeText = (s: string | undefined): string => (s ?? '').trim().toLocaleLowerCase()

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
    case 'explanation':
    case 'firstLetterDiscovery':
      return true // display-only, nothing for the student to answer
    case 'firstLetter':
      return normalizeText(answer.value).length > 0
    case 'columnAddition':
    case 'columnSubtraction': {
      const digits = String(expectedColumnResult(item)).length
      return Array.from({ length: digits }).every((_, i) => /^\d$/.test(answer.values?.[i] ?? ''))
    }
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
    case 'explanation':
    case 'firstLetterDiscovery':
      return true // display-only, always counts as correct
    case 'missingOperand': {
      const value = toNumber(answer.value)
      if (value == null) return false
      return Math.abs(value - solveMissingOperand(item)) < 1e-9
    }
    case 'firstLetter':
      return normalizeText(answer.value) === normalizeText(item.result)
    case 'columnAddition':
    case 'columnSubtraction': {
      const expected = expectedColumnResult(item)
      const digits = String(expected).length
      // digit place-values are stored index 0 = units, so rebuild MSB-first for parsing.
      const reconstructed = Array.from({ length: digits }, (_, i) => answer.values?.[digits - 1 - i] ?? '').join('')
      return /^\d+$/.test(reconstructed) && Number(reconstructed) === expected
    }
    case 'columnMultiplication': {
      const value = toNumber(answer.value)
      if (value == null) return false
      return value === expectedColumnResult(item)
    }
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
    case 'relativeAddition':
    case 'relativeSubtraction':
    case 'decimalAddition':
    case 'decimalSubtraction': {
      const value = toNumber(answer.value)
      if (value == null) return false
      return Math.abs(value - expectedSimpleResult(item)) < 1e-9
    }
    default: {
      const value = toNumber(answer.value)
      if (value == null) return false
      return Math.abs(value - item.result) < 1e-9
    }
  }
}
