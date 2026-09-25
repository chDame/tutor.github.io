// One-off content fix: in simple-additions-10/20/50/100, exercise files 3-10,
// any page whose first item is "missingNumbers" gets that item replaced by a
// missingOperand item built from the reverse of the page's 2nd addition
// (addition #2): swap its operands and hide the second one.
// For simple-additions-50/100 the natural reversal never lands in the
// required x range (the existing addition operands are single-digit), so a
// fresh in-range x is generated instead, paired with a small addend.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content', 'algebra')

const RANGES = {
  'simple-additions-50': [20, 50],
  'simple-additions-100': [50, 96],
}

function makeRng(seed) {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min

let seed = 1
let fixed = 0

for (const level of ['simple-additions-10', 'simple-additions-20', 'simple-additions-50', 'simple-additions-100']) {
  const range = RANGES[level]

  for (let n = 3; n <= 10; n++) {
    const path = join(CONTENT_ROOT, level, `${n}_exercises.json`)
    const doc = JSON.parse(readFileSync(path, 'utf8'))
    let changed = false

    for (const page of doc.pages) {
      const first = page.items[0]
      if (!first || first.type !== 'missingNumbers') continue

      const additions = page.items.filter((it) => it.type === 'addition')
      const add2 = additions[1]
      if (!add2) throw new Error(`${path}: expected a 2nd addition on a missingNumbers-first page`)

      const rng = makeRng(seed++)
      let x, y, result
      if (range) {
        x = randInt(rng, range[0], range[1])
        y = randInt(rng, 1, 20)
        result = x + y
      } else {
        // reverse of addition #2: swap operands, hide the second one
        x = add2.y
        result = add2.x + add2.y
      }

      const replaced = { id: first.id, type: 'missingOperand', x, operator: '+', y: null, result }
      page.items[0] = replaced
      changed = true
      fixed++
    }

    if (changed) writeFileSync(path, JSON.stringify(doc, null, 2))
  }
}

console.log(`Replaced ${fixed} missingNumbers-first pages with reversed-addition missingOperand items.`)
