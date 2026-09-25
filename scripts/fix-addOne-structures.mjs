// One-off content fix:
// - addOneTo50 exercises 5-9: each page currently has
//     missingNumbers, addition(x), addition(x+1), missingOperand(x -> x+1)
//   Practice 3/4 established the fuller pattern (3 sequential additions with
//   the missingOperand sandwiched between the first two):
//     missingNumbers, addition(x), missingOperand(x -> x+1), addition(x+1), addition(x+2)
//   This adds the missing addition(x+2) and reorders to match.
// - addOneTo100 (all exercises): each page gets 2 more sequential additions
//   appended after the existing ones (before missingOperand, if present).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content', 'algebra')

function uniqueId(existingIds, base) {
  let id = base
  let n = 2
  while (existingIds.has(id)) id = `${base}-${n++}`
  existingIds.add(id)
  return id
}

function fixAddOneTo50() {
  const dir = join(CONTENT_ROOT, 'addOneTo50')
  for (const n of [5, 6, 7, 8, 9]) {
    const path = join(dir, `${n}_exercises.json`)
    const doc = JSON.parse(readFileSync(path, 'utf8'))

    for (const page of doc.pages) {
      const existingIds = new Set(page.items.map((it) => it.id))
      const missingNumbers = page.items.find((it) => it.type === 'missingNumbers')
      const additions = page.items.filter((it) => it.type === 'addition').sort((a, b) => a.x - b.x)
      const missingOperand = page.items.find((it) => it.type === 'missingOperand')
      if (!missingNumbers || additions.length !== 2 || !missingOperand) {
        throw new Error(`Unexpected page shape in ${path}`)
      }
      const [add1, add2] = additions
      const add3 = { type: 'addition', x: add2.x + 1, y: 1, id: uniqueId(existingIds, `${add2.id}c`) }
      page.items = [missingNumbers, add1, missingOperand, add2, add3]
    }

    writeFileSync(path, JSON.stringify(doc, null, 2))
  }
  console.log('addOneTo50: fixed exercises 5-9.')
}

function fixAddOneTo100() {
  const dir = join(CONTENT_ROOT, 'addOneTo100')
  let pagesFixed = 0
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const path = join(dir, `${n}_exercises.json`)
    const doc = JSON.parse(readFileSync(path, 'utf8'))

    for (const page of doc.pages) {
      const existingIds = new Set(page.items.map((it) => it.id))
      const additions = page.items.filter((it) => it.type === 'addition').sort((a, b) => a.x - b.x)
      const rest = page.items.filter((it) => it.type !== 'addition')
      const missingOperandIdx = rest.findIndex((it) => it.type === 'missingOperand')
      const lastX = additions[additions.length - 1].x
      const extra = [
        { type: 'addition', x: lastX + 1, y: 1, id: uniqueId(existingIds, `${additions[additions.length - 1].id}c`) },
        { type: 'addition', x: lastX + 2, y: 1, id: uniqueId(existingIds, `${additions[additions.length - 1].id}d`) },
      ]
      const newAdditions = [...additions, ...extra]
      if (missingOperandIdx === -1) {
        page.items = [...rest, ...newAdditions]
      } else {
        const before = rest.slice(0, missingOperandIdx)
        const after = rest.slice(missingOperandIdx)
        page.items = [...before, ...newAdditions, ...after]
      }
      pagesFixed++
    }

    writeFileSync(path, JSON.stringify(doc, null, 2))
  }
  console.log(`addOneTo100: added 2 additions to ${pagesFixed} pages across all 10 exercises.`)
}

fixAddOneTo50()
fixAddOneTo100()
