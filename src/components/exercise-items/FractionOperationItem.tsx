import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type FractionOperation = Extract<ExerciseItem, { type: 'fractionAddition' | 'fractionSubtraction' }>

export default function FractionOperationItem({ item, answer, onChange }: ItemProps<FractionOperation>) {
  return (
    <div className="item-box">
      <div className="item-expr">
        {item.x.num}/{item.x.den} {item.type === 'fractionAddition' ? '+' : '−'} {item.y.num}/{item.y.den} = ?
      </div>
      <div className="item-inputs">
        <input inputMode="numeric" value={answer.num ?? ''} onChange={(e) => onChange({ num: e.target.value })} />
        <span className="frac-bar">/</span>
        <input inputMode="numeric" value={answer.den ?? ''} onChange={(e) => onChange({ den: e.target.value })} />
      </div>
    </div>
  )
}
