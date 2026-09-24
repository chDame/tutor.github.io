import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type MissingOperand = Extract<ExerciseItem, { type: 'missingOperand' }>

export default function MissingOperandItem({ item, answer, onChange }: ItemProps<MissingOperand>) {
  return (
    <div className="item-box">
      <div className="item-expr">
        {item.x ?? '?'} {item.operator} {item.y ?? '?'} = {item.result}
      </div>
      <div className="item-inputs">
        <input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
    </div>
  )
}
