import type { ExerciseItem } from '../../types'
import { orderedMissingIndices } from '../../utils/checkAnswer'
import type { ItemProps } from './common'

type MissingNumbers = Extract<ExerciseItem, { type: 'missingNumbers' }>

export default function MissingNumbersItem({ item, answer, onChange }: ItemProps<MissingNumbers>) {
  const indices = orderedMissingIndices(item)
  const values = answer.values ?? []

  const setValueAt = (pos: number, value: string) => {
    const next = [...values]
    next[pos] = value
    onChange({ values: next })
  }

  return (
    <div className="item-box missingNumbers">
      <div className="sequence">
        {Array.from({ length: item.length }, (_, i) => {
          const pos = indices.indexOf(i)
          const isLast = i === item.length - 1
          if (pos === -1) {
            return (
              <span className={`sequence-value ${isLast ? 'sequence-value-last' : ''}`} key={i}>
                {item.start + i}
              </span>
            )
          }
          return (
            <span className={`sequence-blank ${isLast ? 'sequence-blank-last' : ''}`} key={i}>
              <input
                inputMode="numeric"
                value={values[pos] ?? ''}
                onChange={(e) => setValueAt(pos, e.target.value)}
              />
            </span>
          )
        })}
      </div>
    </div>
  )
}
