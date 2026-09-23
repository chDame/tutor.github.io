// Rebuilds manifest.json for a topic entirely from its level template
// (manifest-templates/<topic>.json — slugs/titles/order) plus whatever
// exercise files actually exist on disk. manifest.json is a pure derived
// build artifact: never hand-edit it, and level structure never lives inside
// it — only in the template. Run this after hand-editing an exercise's JSON,
// since the manifest doesn't auto-follow those edits.
//
// With no argument, syncs every topic that has a template.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildManifestForTopic } from './lib/buildManifest.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, 'manifest-templates')
const CONTENT_DIR = join(__dirname, '..', 'public', 'content')

function syncTopic(topic) {
  const templatePath = join(TEMPLATES_DIR, `${topic}.json`)
  if (!existsSync(templatePath)) {
    console.log(`Skipping "${topic}" — no manifest-templates/${topic}.json.`)
    return
  }

  const template = JSON.parse(readFileSync(templatePath, 'utf8'))
  const contentRoot = join(CONTENT_DIR, topic)
  mkdirSync(contentRoot, { recursive: true })

  const manifest = buildManifestForTopic(template, contentRoot)
  writeFileSync(join(contentRoot, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Synced ${join(contentRoot, 'manifest.json')} from ${template.levels.length} template levels.`)
}

const requestedTopic = process.argv[2]
const topics = requestedTopic
  ? [requestedTopic]
  : readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))

for (const topic of topics) syncTopic(topic)
