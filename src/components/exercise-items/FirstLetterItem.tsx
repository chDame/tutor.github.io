import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type FirstLetter = Extract<ExerciseItem, { type: 'firstLetter' }>

export default function FirstLetterItem({ item, answer, onChange }: ItemProps<FirstLetter>) {
  return (
    <div className="item-box first-letter">
      <div className="first-letter-prompt">
        <span style={{ fontSize: 64 }}>{item.emoji}</span>
        <span className="item-inputs">
          <input
            maxLength={1}
            value={answer.value ?? ''}
            onChange={(e) => onChange({ value: e.target.value })}
            aria-label="Première lettre"
          />
        </span>
        <span>{item.wordSuffix}</span>
      </div>
    </div>
  )
}
