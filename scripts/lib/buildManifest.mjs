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

export function buildManifestForTopic(template, contentRoot) {
  const manifest = { topic: template.topic, levels: [] }

  for (const { slug, title } of template.levels) {
    const levelDir = join(contentRoot, slug)
    const exercises = exerciseFilesInLevel(levelDir).map((file) => {
      const doc = JSON.parse(readFileSync(join(levelDir, file), 'utf8'))
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
