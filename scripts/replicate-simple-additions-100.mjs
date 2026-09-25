// One-off: replicates simple-additions-50 -> simple-additions-100, adding 50
// to the first operand only (x in addition/missingOperand, the first number
// in each "problem" word problem's text) — the second operand/number is
// left untouched. Overwrites simple-additions-100 entirely.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, '..', 'public', 'content', 'algebra', 'simple-additions-50')
const DEST = join(__dirname, '..', 'public', 'content', 'algebra', 'simple-additions-100')
mkdirSync(DEST, { recursive: true })

function shiftProblem(item) {
  const m1 = item.question.match(/has (\d+)/)
  const m2 = item.question.match(/gets (\d+) more/)
  if (!m1 || !m2) throw new Error(`Unrecognized problem template: "${item.question}"`)
  const n1 = Number(m1[1])
  const n2 = Number(m2[1])
  const newN1 = n1 + 50
  const question = item.question.replace(`has ${n1}`, `has ${newN1}`)
  return { ...item, question, result: newN1 + n2 }
}

for (let n = 1; n <= 10; n++) {
  const doc = JSON.parse(readFileSync(join(SRC, `${n}_exercises.json`), 'utf8'))

  doc.id = doc.id.replace('50', '100')
  doc.title = doc.title.replace('50', '100')

  for (const page of doc.pages) {
    page.items = page.items.map((item) => {
      if (item.type === 'addition') return { ...item, x: item.x + 50 }
      if (item.type === 'missingOperand') return item.x == null ? item : { ...item, x: item.x + 50, result: item.result + 50 }
      if (item.type === 'problem') return shiftProblem(item)
      return item
    })
  }

  writeFileSync(join(DEST, `${n}_exercises.json`), JSON.stringify(doc, null, 2))
}

console.log('Replicated simple-additions-50 -> simple-additions-100 (first operand +50, second operand unchanged).')
