import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type SimpleOperation = Extract<
  ExerciseItem,
  { type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'relativeAddition' | 'relativeSubtraction' | 'decimalAddition' | 'decimalSubtraction' }
>

const OP_SYMBOL: Record<SimpleOperation['type'], string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
  relativeAddition: '+',
  relativeSubtraction: '−',
  decimalAddition: '+',
  decimalSubtraction: '−',
}

const fmt = (n: number) => (n < 0 ? `(${n})` : `${n}`)

export default function SimpleOperationItem({ item, answer, onChange }: ItemProps<SimpleOperation>) {
  const isDecimal = item.type.startsWith('decimal')
  const xs = isDecimal ? item.x.toFixed(1) : fmt(item.x)
  const ys = isDecimal ? item.y.toFixed(1) : fmt(item.y)

  return (
    <div className="item-box">
      <div className="item-expr">
        {xs} {OP_SYMBOL[item.type]} {ys} = 
      <div className="item-inputs">
        <input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
      </div>
    </div>
  )
}
