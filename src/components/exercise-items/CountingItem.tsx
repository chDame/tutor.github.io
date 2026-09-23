import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'
import CountingIcons from './CountingIcons'

type Counting = Extract<ExerciseItem, { type: 'counting' }>

export default function CountingItem({ item, answer, onChange }: ItemProps<Counting>) {
  return (
    <div className="item-box counting">
      <div className="item-question">
        Count the number of {item.countingElement}s:<br />
        <CountingIcons element={item.countingElement} count={item.result} />
      </div>
      <div className="item-inputs">
        <input inputMode="decimal" value={answer.value ?? ''} onChange={(e) => onChange({ value: e.target.value })} />
      </div>
    </div>
  )
}
