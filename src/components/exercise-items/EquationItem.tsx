import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type Equation = Extract<ExerciseItem, { type: 'equation' }>

export default function EquationItem({ item, answer, onChange }: ItemProps<Equation>) {
  return (
    <div className="item-box">
      <div className="item-expr">{item.equation}</div>
      <div className="item-inputs">
        <span>x =</span>
        <input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
    </div>
  )
}
