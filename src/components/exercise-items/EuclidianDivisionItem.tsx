import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type EuclidianDivision = Extract<ExerciseItem, { type: 'euclidianDivision' }>

export default function EuclidianDivisionItem({ item, answer, onChange }: ItemProps<EuclidianDivision>) {
  return (
    <div className="item-box">
      <div className="item-expr">
        {item.x} ÷ {item.y} = ?
      </div>
      <div className="item-inputs">
        <span>q:</span>
        <input
          inputMode="numeric"
          value={answer.quotient ?? ''}
          onChange={(e) => onChange({ quotient: e.target.value })}
        />
        <span>r:</span>
        <input
          inputMode="numeric"
          value={answer.remainder ?? ''}
          onChange={(e) => onChange({ remainder: e.target.value })}
        />
      </div>
    </div>
  )
}
