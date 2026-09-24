import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type Explanation = Extract<ExerciseItem, { type: 'explanation' }>

/** Display-only: teacher-authored HTML content, not a question. */
export default function ExplanationItem({ item }: ItemProps<Explanation>) {
  return <div className="item-box explanation" dangerouslySetInnerHTML={{ __html: item.html }} />
}
