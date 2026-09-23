import { useRef } from 'react'
import type { ExerciseItem } from '../../types'
import { expectedColumnResult, type ColumnOperation } from '../../utils/checkAnswer'
import type { ItemProps } from './common'

type ColumnAddSub = Extract<ExerciseItem, { type: 'columnAddition' | 'columnSubtraction' }>

const SYMBOL: Record<ColumnAddSub['type'], string> = {
  columnAddition: '+',
  columnSubtraction: '−',
}

/**
 * Single-digit-per-place-value entry, right-aligned under the operands above
 * (both rendered as fixed-width cell grids so they line up exactly). Typing
 * flows units-first: filling a digit auto-advances to the next (more
 * significant) box, and focusing a box snaps back to the earliest empty box
 * to its right if one exists.
 */
export default function ColumnDigitsItem({ item, answer, onChange }: ItemProps<ColumnAddSub>) {
  const expected = expectedColumnResult(item as ColumnOperation)
  const resultStr = String(expected)
  const numDigits = resultStr.length
  const values = answer.values ?? []

  const opDigits = item.operands.map((n) => String(n).split(''))
  const totalWidth = Math.max(resultStr.length, ...opDigits.map((d) => d.length))
  const padRow = (chars: string[]): (string | null)[] => [...Array(totalWidth - chars.length).fill(null), ...chars]
  const operandRows = opDigits.map(padRow)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  // Set right before a programmatic focus() so the resulting onFocus doesn't
  // fight it — the parent hasn't re-rendered with the new digit yet, so
  // handleFocus would otherwise see the just-filled box as still empty.
  const skipRedirectRef = useRef(false)

  const setDigit = (place: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...values]
    next[place] = digit
    onChange({ values: next })
    if (digit && place < numDigits - 1) {
      skipRedirectRef.current = true
      inputRefs.current[place + 1]?.focus()
    }
  }

  const handleFocus = (place: number) => {
    if (skipRedirectRef.current) {
      skipRedirectRef.current = false
      return
    }
    for (let j = 0; j < place; j++) {
      if (!values[j]) {
        inputRefs.current[j]?.focus()
        return
      }
    }
  }

  return (
    <div className="item-box">
      <div className="digit-grid">
        {operandRows.map((row, ri) => (
          <div className="digit-row" key={ri}>
            <span className="digit-cell operator-cell">{ri === operandRows.length - 1 ? SYMBOL[item.type] : ''}</span>
            {row.map((ch, ci) => (
              <span className="digit-cell" key={ci}>
                {ch ?? ''}
              </span>
            ))}
          </div>
        ))}
        <div className="rule-row" />
        <div className="digit-row">
          <span className="digit-cell operator-cell" />
          {Array.from({ length: totalWidth }, (_, ci) => {
            const place = totalWidth - 1 - ci
            if (place >= numDigits) return <span className="digit-cell" key={ci} />
            return (
              <input
                key={ci}
                ref={(el) => {
                  inputRefs.current[place] = el
                }}
                className="digit-cell digit-input"
                inputMode="numeric"
                maxLength={1}
                value={values[place] ?? ''}
                onFocus={() => handleFocus(place)}
                onChange={(e) => setDigit(place, e.target.value)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
