import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'
import CountingIcons from './CountingIcons'

type DiscoverNumber = Extract<ExerciseItem, { type: 'discoverNumber' }>

/** Rows of numbers, breaking right after every multiple of ten. */
function groupByTens(from: number, to: number): number[][] {
  const rows: number[][] = []
  let row: number[] = []
  for (let n = from; n <= to; n++) {
    row.push(n)
    if (n % 10 === 0 || n === to) {
      rows.push(row)
      row = []
    }
  }
  return rows
}

export default function DiscoverNumberItem({ item }: ItemProps<DiscoverNumber>) {
  const rows = groupByTens(item.from, item.to)

  return (
    <div className="item-box discover-number">
      <div className="item-question">
        Read the numbers {item.displayElements && `and count the number of ${item.countingElement}s`}:<br />
      </div>
      {rows.map((row, i) => (
        <div className={`number-row ${item.displayElements ? 'with-display-elements' : 'no-display-elements'}`} key={i}>
          {row.map((n) => (
            <div className="number-cell" key={n}>
              <span className="discover-number">{n}</span>
              <div className="item-question">
              {item.displayElements && <CountingIcons element={item.countingElement} count={n} />}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
