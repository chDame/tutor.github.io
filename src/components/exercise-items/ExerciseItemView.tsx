import type { ExerciseItem } from '../../types'
import type { AnswerInput } from '../../utils/checkAnswer'
import SimpleOperationItem from './SimpleOperationItem'
import ColumnOperationItem from './ColumnOperationItem'
import ColumnDigitsItem from './ColumnDigitsItem'
import EuclidianDivisionItem from './EuclidianDivisionItem'
import FractionOperationItem from './FractionOperationItem'
import EquationItem from './EquationItem'
import ProblemItem from './ProblemItem'
import CountingItem from './CountingItem'
import MissingNumbersItem from './MissingNumbersItem'
import DiscoverNumberItem from './DiscoverNumberItem'

interface Props {
  item: ExerciseItem
  answer: AnswerInput
  onChange: (patch: AnswerInput) => void
}

export default function ExerciseItemView({ item, answer, onChange }: Props) {
  switch (item.type) {
    case 'counting':
      return <CountingItem item={item} answer={answer} onChange={onChange} />
    case 'missingNumbers':
      return <MissingNumbersItem item={item} answer={answer} onChange={onChange} />
    case 'discoverNumber':
      return <DiscoverNumberItem item={item} answer={answer} onChange={onChange} />
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
    case 'relativeAddition':
    case 'relativeSubtraction':
    case 'decimalAddition':
    case 'decimalSubtraction':
      return <SimpleOperationItem item={item} answer={answer} onChange={onChange} />
    case 'columnAddition':
    case 'columnSubtraction':
      return <ColumnDigitsItem item={item} answer={answer} onChange={onChange} />
    case 'columnMultiplication':
      return <ColumnOperationItem item={item} answer={answer} onChange={onChange} />
    case 'euclidianDivision':
      return <EuclidianDivisionItem item={item} answer={answer} onChange={onChange} />
    case 'fractionAddition':
    case 'fractionSubtraction':
      return <FractionOperationItem item={item} answer={answer} onChange={onChange} />
    case 'equation':
      return <EquationItem item={item} answer={answer} onChange={onChange} />
    case 'problem':
      return <ProblemItem item={item} answer={answer} onChange={onChange} />
  }
}
