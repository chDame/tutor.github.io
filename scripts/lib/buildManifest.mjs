// Builds a topic's manifest object from its level template (slugs/titles/order)
// plus whatever exercise files actually exist on disk for each level. This is
// the single place that turns "template + files" into a manifest.json, used
// by both generate-content.mjs (fresh content) and sync-manifest.mjs (refresh
// metadata after hand-editing an exercise file).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const EXERCISE_FILE_RE = /^(\d+)_exercises\.json$/

function exerciseFilesInLevel(levelDir) {
  if (!existsSync(levelDir)) return []
  return readdirSync(levelDir)
    .filter((f) => EXERCISE_FILE_RE.test(f))
    .sort((a, b) => Number(a.match(EXERCISE_FILE_RE)[1]) - Number(b.match(EXERCISE_FILE_RE)[1]))
}

function validateMissingNumbers(item, file) {
  if (!Number.isInteger(item.start)) {
    throw new Error(`${file}: missingNumbers.start must be an integer`)
  }
  if (!Number.isInteger(item.length) || item.length < 1) {
    throw new Error(`${file}: missingNumbers.length must be a positive integer`)
  }
  if (!Array.isArray(item.missingIndices) || item.missingIndices.length === 0) {
    throw new Error(`${file}: missingNumbers.missingIndices must be a non-empty array`)
  }
  const seen = new Set()
  for (const index of item.missingIndices) {
    if (!Number.isInteger(index) || index < 0 || index >= item.length) {
      throw new Error(`${file}: missingNumbers.missingIndices must stay within the sequence length`)
    }
    if (seen.has(index)) {
      throw new Error(`${file}: missingNumbers.missingIndices must not contain duplicates`)
    }
    seen.add(index)
  }
}

// Item ids are no longer authored — the app assigns them sequentially at
// load time (see ExerciseScreen), so there's nothing to check for duplicates
// here anymore.
function validateExerciseDoc(doc, file) {
  doc.pages.forEach((page) => {
    page.items.forEach((item) => {
      if (item.type === 'missingNumbers') {
        validateMissingNumbers(item, file)
      }
    })
  })
}

export function buildManifestForTopic(template, contentRoot) {
  const manifest = { topic: template.topic, levels: [] }

  for (const { slug, title } of template.levels) {
    const levelDir = join(contentRoot, slug)
    const exercises = exerciseFilesInLevel(levelDir).map((file) => {
      const doc = JSON.parse(readFileSync(join(levelDir, file), 'utf8'))
      validateExerciseDoc(doc, `${slug}/${file}`)
      return {
        file: `${slug}/${file}`,
        id: doc.id,
        title: doc.title,
        evaluation: doc.evaluation,
        difficulty: doc.difficulty,
        character: doc.character ?? null,
      }
    })
    manifest.levels.push({ slug, title, exercises })
  }

  return manifest
}
