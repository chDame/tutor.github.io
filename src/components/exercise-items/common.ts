import type { AnswerInput } from '../../utils/checkAnswer'

export interface ItemProps<T> {
  item: T
  answer: AnswerInput
  onChange: (patch: AnswerInput) => void
}
