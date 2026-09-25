export interface Fraction {
  num: number
  den: number
}

export type ExerciseItem =
  | { id: string; type: 'addition'; x: number; y: number }
  | { id: string; type: 'subtraction'; x: number; y: number }
  | { id: string; type: 'multiplication'; x: number; y: number }
  | { id: string; type: 'division'; x: number; y: number }
  | { id: string; type: 'relativeAddition'; x: number; y: number }
  | { id: string; type: 'relativeSubtraction'; x: number; y: number }
  | { id: string; type: 'decimalAddition'; x: number; y: number }
  | { id: string; type: 'decimalSubtraction'; x: number; y: number }
  | { id: string; type: 'columnAddition'; operands: number[] }
  | { id: string; type: 'columnSubtraction'; operands: number[] }
  | { id: string; type: 'columnMultiplication'; operands: number[] }
  | { id: string; type: 'euclidianDivision'; x: number; y: number; quotient: number; remainder: number }
  | { id: string; type: 'fractionAddition' | 'fractionSubtraction'; x: Fraction; y: Fraction; result: Fraction }
  | { id: string; type: 'equation'; equation: string; result: number }
  | { id: string; type: 'problem'; question: string; result: number }
  | { id: string; type: 'firstLetter'; emoji: string; wordSuffix: string; result: string }
  | { id: string; type: 'counting'; countingElement: string; result: number }
  | { id: string; type: 'missingNumbers'; start: number; length: number; missingIndices: number[] }
  | { id: string; type: 'discoverNumber'; from: number; to: number; displayElements: boolean; countingElement: string }
  | { id: string; type: 'missingOperand'; x: number | null; operator: '+' | '-' | '×' | '÷' | '%'; y: number | null; result: number }
  | { id: string; type: 'explanation'; html: string }

export type ExerciseItemType = ExerciseItem['type']

export interface ExercisePage {
  items: ExerciseItem[]
}

export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5

/** One node in the progression path: a "series of exercises" JSON document. */
export interface ExerciseDoc {
  id: string
  title: string
  evaluation: boolean
  difficulty: Difficulty
  pages: ExercisePage[]
}

export interface ManifestExerciseEntry {
  character: { image: string; position: 'left' | 'right' } | null;
  file: string
  id: string
  title: string
  evaluation: boolean
  difficulty: Difficulty
}

export interface ManifestLevel {
  slug: string
  title: string
  exercises: ManifestExerciseEntry[]
}

export interface TopicManifest {
  topic: string
  levels: ManifestLevel[]
}

export type Score = 0 | 1 | 2 | 3 | 4 | 5

export interface Topic {
  slug: string
  title: string
  emoji: string
  available: boolean
}

export interface Account {
  username: string
  birthYear: number
}
