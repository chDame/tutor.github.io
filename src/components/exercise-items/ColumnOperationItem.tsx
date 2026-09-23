import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type ColumnOperation = Extract<ExerciseItem, { type: 'columnAddition' | 'columnSubtraction' | 'columnMultiplication' }>

const SYMBOL: Record<ColumnOperation['type'], string> = {
  columnAddition: '+',
  columnSubtraction: '−',
  columnMultiplication: '×',
}

export default function ColumnOperationItem({ item, answer, onChange }: ItemProps<ColumnOperation>) {
  return (
    <div className="item-box">
      <div className="column-stack">
        {item.operands.map((n, i) => (
          <div className="op-row" key={i}>
            {i === item.operands.length - 1 && <span>{SYMBOL[item.type]}</span>}
            <span>{n}</span>
          </div>
        ))}
        <div className="rule" />
      </div>
      <div className="item-inputs">
        <input inputMode="numeric" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
    </div>
  )
}
