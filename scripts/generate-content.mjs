// One-off content generator: writes public/content/algebra/**.
// Deterministic (seeded RNG) so re-running reproduces the same content.
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildManifestForTopic } from './lib/buildManifest.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_ROOT = join(__dirname, '..', 'public', 'content', 'algebra')
const TEMPLATE = JSON.parse(readFileSync(join(__dirname, 'manifest-templates', 'algebra.json'), 'utf8'))

// --- seeded RNG (mulberry32) -------------------------------------------------
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
const pick = (rng, arr) => arr[randInt(rng, 0, arr.length - 1)]

const NAMES = ['Paul', 'Ana', 'Josh', 'Maria', 'Liam', 'Sophie', 'Noah', 'Emma']
const OTHERS = (rng, exclude) => pick(rng, NAMES.filter((n) => n !== exclude))
const ITEM_WORDS = ['pens', 'apples', 'marbles', 'stickers', 'candies', 'books', 'coins', 'balloons']

const gcd = (a, b) => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
const reduceFraction = (num, den) => {
  const d = gcd(num, den)
  return { num: num / d, den: den / d }
}

// Item ids are no longer authored — the app assigns them at load time.
const item = (type, fields) => ({ type, ...fields })

// --- per-level item generators -----------------------------------------------
const GENERATORS = {
  basic: (rng) => {
    const x = randInt(rng, 1, 5)
    const y = randInt(rng, 1, 5)
    return item('addition', { x, y })
  },
  basic5: (rng) => GENERATORS.basic(rng),
  basic10: (rng) => GENERATORS.basic(rng),
  basic20: (rng) => GENERATORS.basic(rng),
  addOne: (rng) => {
    const x = randInt(rng, 1, 20)
    return item('addition', { x, y: 1 })
  },
  addOneTo10: (rng) => GENERATORS.addOne(rng),
  addOneTo20: (rng) => GENERATORS.addOne(rng),
  'simple-additions': (rng) => {
    const x = randInt(rng, 1, 20)
    const y = randInt(rng, 1, 20)
    return item('addition', { x, y })
  },
  'simple-subtractions': (rng) => {
    const x = randInt(rng, 10, 30)
    const y = randInt(rng, 1, x - 1)
    return item('subtraction', { x, y })
  },
  'simple-multiplications': (rng) => {
    const x = randInt(rng, 1, 10)
    const y = randInt(rng, 1, 10)
    return item('multiplication', { x, y })
  },
  'simple-divisions': (rng) => {
    const y = randInt(rng, 2, 10)
    const quotient = randInt(rng, 1, 10)
    return item('division', { x: y * quotient, y })
  },
  'column-additions': (rng) => {
    const a = randInt(rng, 100, 999)
    const b = randInt(rng, 100, 999)
    return item('columnAddition', { operands: [a, b] })
  },
  'column-subtractions': (rng) => {
    const a = randInt(rng, 200, 999)
    const b = randInt(rng, 10, a - 1)
    return item('columnSubtraction', { operands: [a, b] })
  },
  'column-multiplications': (rng) => {
    const a = randInt(rng, 10, 99)
    const b = randInt(rng, 2, 9)
    return item('columnMultiplication', { operands: [a, b] })
  },
  'euclidian-divisions': (rng) => {
    const divisor = randInt(rng, 2, 9)
    const quotient = randInt(rng, 2, 12)
    const remainder = randInt(rng, 0, divisor - 1)
    return item('euclidianDivision', { x: divisor * quotient + remainder, y: divisor, quotient, remainder })
  },
  'relative-numbers': (rng) => {
    const type = pick(rng, ['relativeAddition', 'relativeSubtraction'])
    const x = randInt(rng, -20, 20) || 3
    const y = randInt(rng, -20, 20) || -4
    return item(type, { x, y })
  },
  'decimal-numbers': (rng) => {
    const type = pick(rng, ['decimalAddition', 'decimalSubtraction'])
    let x = randInt(rng, 10, 999) / 10
    let y = randInt(rng, 1, 500) / 10
    if (type === 'decimalSubtraction' && y > x) [x, y] = [y, x]
    return item(type, { x, y })
  },
  fractions: (rng) => {
    const type = pick(rng, ['fractionAddition', 'fractionSubtraction'])
    const den = randInt(rng, 4, 10)
    let numX = randInt(rng, 1, den - 1)
    let numY = randInt(rng, 1, den - 1)
    if (type === 'fractionSubtraction' && numY > numX) [numX, numY] = [numY, numX]
    const rawResult = type === 'fractionAddition' ? numX + numY : numX - numY
    const result = reduceFraction(Math.max(rawResult, 0) || 0, den)
    return item(type, { x: { num: numX, den }, y: { num: numY, den }, result })
  },
  equations: (rng) => {
    const a = randInt(rng, 1, 20)
    const xTrue = randInt(rng, 1, 30)
    const form = pick(rng, ['add', 'sub'])
    if (form === 'add') {
      return item('equation', { equation: `x + ${a} = ${xTrue + a}`, result: xTrue })
    }
    const b = xTrue - a
    return item('equation', { equation: `x - ${a} = ${b}`, result: xTrue })
  },
}

// --- per-level word-problem templates ---------------------------------------
const PROBLEM_TEMPLATES = {
  basic: additionProblem,
  basic5: additionProblem,
  basic10: additionProblem,
  basic20: additionProblem,
  addOne: additionProblem,
  addOneTo10: additionProblem,
  addOneTo20: additionProblem,
  'simple-additions': additionProblem,
  'column-additions': additionProblem,
  'simple-subtractions': subtractionProblem,
  'column-subtractions': subtractionProblem,
  'simple-multiplications': multiplicationProblem,
  'column-multiplications': multiplicationProblem,
  'simple-divisions': divisionProblem,
  'euclidian-divisions': divisionProblem,
  'relative-numbers': relativeProblem,
  'decimal-numbers': decimalProblem,
  fractions: fractionProblem,
  equations: equationProblem,
}

function additionProblem(rng) {
  const name = pick(rng, NAMES)
  const other = OTHERS(rng, name)
  const words = pick(rng, ITEM_WORDS)
  const a = randInt(rng, 5, 40)
  const b = randInt(rng, 2, 20)
  return item('problem', {
    question: `${name} had ${a} ${words}. ${other} gave ${name} ${b} more ${words}. How many ${words} does ${name} have now?`,
    result: a + b,
  })
}
function subtractionProblem(rng) {
  const name = pick(rng, NAMES)
  const other1 = OTHERS(rng, name)
  const other2 = pick(rng, NAMES.filter((n) => n !== name && n !== other1))
  const words = pick(rng, ITEM_WORDS)
  const total = randInt(rng, 20, 50)
  const b = randInt(rng, 2, Math.floor(total / 3))
  const c = randInt(rng, 2, Math.floor(total / 3))
  return item('problem', {
    question: `${name} was having ${total} ${words} but gave ${b} to ${other1} and ${c} to ${other2}. How many ${words} does ${name} still have?`,
    result: total - b - c,
  })
}
function multiplicationProblem(rng) {
  const name = pick(rng, NAMES)
  const words = pick(rng, ITEM_WORDS)
  const boxes = randInt(rng, 2, 9)
  const perBox = randInt(rng, 2, 12)
  return item('problem', {
    question: `${name} has ${boxes} boxes with ${perBox} ${words} in each box. How many ${words} does ${name} have in total?`,
    result: boxes * perBox,
  })
}
function divisionProblem(rng) {
  const name = pick(rng, NAMES)
  const words = pick(rng, ITEM_WORDS)
  const friends = randInt(rng, 2, 8)
  const each = randInt(rng, 2, 10)
  return item('problem', {
    question: `${name} has ${friends * each} ${words} to share equally among ${friends} friends. How many ${words} does each friend get?`,
    result: each,
  })
}
function relativeProblem(rng) {
  const start = randInt(rng, -10, 15)
  const delta = randInt(rng, 1, 15)
  const rose = pick(rng, [true, false])
  return item('problem', {
    question: `The temperature was ${start}°C in the morning. It ${rose ? 'rose' : 'dropped'} by ${delta} degrees. What is the temperature now?`,
    result: rose ? start + delta : start - delta,
  })
}
function decimalProblem(rng) {
  const name = pick(rng, NAMES)
  const x = randInt(rng, 50, 999) / 10
  const spend = pick(rng, [true, false])
  const y = randInt(rng, 10, spend ? Math.max(10, Math.floor(x * 10) - 10) : 500) / 10
  const result = Math.round((spend ? x - Math.min(y, x - 0.1) : x + y) * 10) / 10
  const amount = spend ? Math.min(y, x - 0.1) : y
  return item('problem', {
    question: `${name} has $${x.toFixed(1)} and ${spend ? `spends $${amount.toFixed(1)}` : `receives $${amount.toFixed(1)} more`}. How much money does ${name} have now?`,
    result,
  })
}
function fractionProblem(rng) {
  const name = pick(rng, NAMES)
  const other = OTHERS(rng, name)
  const den = randInt(rng, 6, 10)
  const numX = randInt(rng, 1, Math.floor(den / 2))
  const numY = randInt(rng, 1, den - numX - 1 || 1)
  return item('problem', {
    question: `A pizza is cut into ${den} equal slices. ${name} eats ${numX} slices and ${other} eats ${numY} slices. How many slices are left?`,
    result: den - numX - numY,
  })
}
function equationProblem(rng) {
  const a = randInt(rng, 2, 25)
  const xTrue = randInt(rng, 1, 40)
  return item('problem', {
    question: `I think of a number, add ${a} to it, and I get ${xTrue + a}. What is my number?`,
    result: xTrue,
  })
}

// Level slugs/titles/order come from manifest-templates/algebra.json, not from here.
const LEVELS = TEMPLATE.levels

const EXERCISES_PER_LEVEL = 4
const PAGES_PER_EXERCISE = 5
const ITEMS_PER_REGULAR_PAGE = 4

function buildExercise(levelSlug, title, evaluation, difficulty, seed) {
  const rng = makeRng(seed)
  const pages = []
  for (let p = 0; p < PAGES_PER_EXERCISE - 1; p++) {
    const items = Array.from({ length: ITEMS_PER_REGULAR_PAGE }, () => GENERATORS[levelSlug](rng))
    pages.push({ items })
  }
  pages.push({ items: [GENERATORS[levelSlug](rng), PROBLEM_TEMPLATES[levelSlug](rng)] })
  return { id: randomUUID(), title, evaluation, difficulty, pages }
}

function main() {
  mkdirSync(CONTENT_ROOT, { recursive: true })
  let seed = 1

  LEVELS.forEach(({ slug, title }, levelIndex) => {
    const levelDir = join(CONTENT_ROOT, slug)
    mkdirSync(levelDir, { recursive: true })
    const baseDifficulty = Math.round((levelIndex / (LEVELS.length - 1)) * 5)

    for (let i = 0; i < EXERCISES_PER_LEVEL; i++) {
      const isLast = i === EXERCISES_PER_LEVEL - 1
      const exTitle = isLast ? `${title} — Checkpoint` : `${title} — Practice ${i + 1}`
      const difficulty = Math.min(5, baseDifficulty + (isLast ? 1 : 0))
      const doc = buildExercise(slug, exTitle, isLast, difficulty, seed++)
      const file = `${i + 1}_exercises.json`
      writeFileSync(join(levelDir, file), JSON.stringify(doc, null, 2))
    }
  })

  const manifest = buildManifestForTopic(TEMPLATE, CONTENT_ROOT)
  writeFileSync(join(CONTENT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Generated ${LEVELS.length} levels x ${EXERCISES_PER_LEVEL} exercises into ${CONTENT_ROOT}`)
}

main()
