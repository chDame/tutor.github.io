// One-off migration: replaces every "counting" item in basic50/basic100 with
// a "missingNumbers" item, keeping the sequence near the original counted
// number so each page's numeric neighborhood stays roughly the same.
// Deterministic (seeded per item) and roughly 75% non-crossing / 25%
// crossing a tens boundary (e.g. 47,48,49,50,51).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content', 'algebra')
const LEVELS = ['basic50', 'basic100']
const CROSS_PROBABILITY = 0.25

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

function makeMissingNumbers(rng, target, crossBoundary) {
  const length = 4 + Math.floor(rng() * 3) // 4-6
  const decadeStart = Math.floor(target / 10) * 10

  let start
  if (!crossBoundary) {
    const minStart = Math.max(decadeStart, target - length + 1, 0)
    const maxStart = Math.min(decadeStart + 10 - length, target)
    start = maxStart >= minStart ? minStart + Math.floor(rng() * (maxStart - minStart + 1)) : Math.max(decadeStart, 0)
  } else {
    const boundary = decadeStart + 10 // window straddles this multiple of ten
    const minStart = Math.max(boundary - length + 1, 0)
    const maxStart = boundary - 1
    start = minStart + Math.floor(rng() * (maxStart - minStart + 1))
  }

  const numMissing = Math.min(1 + Math.floor(rng() * 2), length) // 1 or 2
  const missingIndices = new Set()
  while (missingIndices.size < numMissing) {
    missingIndices.add(Math.floor(rng() * length))
  }

  return { start, length, missingIndices: [...missingIndices].sort((a, b) => a - b) }
}

let seed = 1
let converted = 0
let crossing = 0

for (const levelSlug of LEVELS) {
  const levelDir = join(CONTENT_ROOT, levelSlug)
  const files = readdirSync(levelDir).filter((f) => /^\d+_exercises\.json$/.test(f))

  for (const file of files) {
    const path = join(levelDir, file)
    const doc = JSON.parse(readFileSync(path, 'utf8'))
    let changed = false

    for (const page of doc.pages ?? []) {
      const items = page.items ?? []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type !== 'counting') continue

        const rng = makeRng(seed++)
        const crossBoundary = rng() < CROSS_PROBABILITY
        const { start, length, missingIndices } = makeMissingNumbers(rng, item.result, crossBoundary)
        items[i] = { id: item.id, type: 'missingNumbers', start, length, missingIndices }
        changed = true
        converted++
        if (crossBoundary) crossing++
      }
    }

    if (changed) writeFileSync(path, JSON.stringify(doc, null, 2))
  }
}

console.log(`Converted ${converted} counting items to missingNumbers (${crossing} crossing a tenth = ${((crossing / converted) * 100).toFixed(0)}%, ${converted - crossing} not).`)
