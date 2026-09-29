import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type MissingOperand = Extract<ExerciseItem, { type: 'missingOperand' }>

export default function MissingOperandItem({ item, answer, onChange }: ItemProps<MissingOperand>) {
  return (
    <div className="item-box">
      <div className="item-expr missingOperand">
        {item.x ? 
        <>{item.x} {item.operator} <div className="item-inputs"><input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} /></div> = {item.result}</>
        :
        <><div className="item-inputs"><input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} /></div> {item.operator} {item.y} = {item.result}</>
        }
      </div>
    </div>
  )
}
