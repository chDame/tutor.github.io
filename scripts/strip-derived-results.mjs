// One-off cleanup: removes the now-unused "result" field from exercise items
// whose answer is derived from operands at check time (see checkAnswer.ts —
// expectedSimpleResult/expectedColumnResult), not stored in content.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content')

const DERIVED_TYPES = new Set([
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'relativeAddition',
  'relativeSubtraction',
  'decimalAddition',
  'decimalSubtraction',
  'columnAddition',
  'columnSubtraction',
  'columnMultiplication',
])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('_exercises.json')) files.push(full)
  }
  return files
}

let filesChanged = 0
let itemsChanged = 0

for (const file of walk(CONTENT_ROOT)) {
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  let changed = false
  for (const page of doc.pages ?? []) {
    for (const item of page.items ?? []) {
      if (DERIVED_TYPES.has(item.type) && 'result' in item) {
        delete item.result
        changed = true
        itemsChanged++
      }
    }
  }
  if (changed) {
    writeFileSync(file, JSON.stringify(doc, null, 2))
    filesChanged++
  }
}

console.log(`Stripped stale "result" from ${itemsChanged} items across ${filesChanged} files.`)
