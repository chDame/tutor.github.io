import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type Problem = Extract<ExerciseItem, { type: 'problem' }>

export default function ProblemItem({ item, answer, onChange }: ItemProps<Problem>) {
  return (
    <div className="item-box problem">
      <div className="item-question">{item.question}</div>
      <div className="item-inputs">
        <input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
    </div>
  )
}
