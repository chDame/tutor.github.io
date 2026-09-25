// One-off cleanup: removes the "id" field from every item in every exercise
// file. Item ids are no longer authored — the app assigns them sequentially
// at load time (see ExerciseScreen) since they're only used as React keys
// and to key the in-session answers map, never persisted. This also
// eliminates the recurring duplicate/missing-id authoring bugs.
// Exercise-doc-level ids (doc.id, used for score persistence) are untouched.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content')

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
      if ('id' in item) {
        delete item.id
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

console.log(`Stripped "id" from ${itemsChanged} items across ${filesChanged} files.`)
