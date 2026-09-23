import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildManifestForTopic } from './buildManifest.mjs'

function withTempContent(run) {
  const root = mkdtempSync(join(tmpdir(), 'build-manifest-'))
  try {
    return run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function writeExercise(root, slug, file, doc) {
  const levelDir = join(root, slug)
  mkdirSync(levelDir, { recursive: true })
  writeFileSync(join(levelDir, file), JSON.stringify(doc, null, 2))
}

test('buildManifestForTopic accepts valid missingNumbers items', () => {
  withTempContent((root) => {
    writeExercise(root, 'basic20', '1_exercises.json', {
      id: 'basic20-practice1',
      title: 'Numbers from 11 to 20 — Practice 1',
      evaluation: false,
      difficulty: 0,
      pages: [
        {
          items: [
            {
              id: '1',
              type: 'missingNumbers',
              start: 14,
              length: 5,
              missingIndices: [1, 3],
            },
          ],
        },
      ],
    })

    const manifest = buildManifestForTopic(
      { topic: 'algebra', levels: [{ slug: 'basic20', title: 'Numbers from 11 to 20' }] },
      root,
    )

    assert.equal(manifest.levels[0].exercises.length, 1)
    assert.equal(manifest.levels[0].exercises[0].id, 'basic20-practice1')
  })
})

test('buildManifestForTopic rejects missingNumbers indices outside the sequence length', () => {
  withTempContent((root) => {
    writeExercise(root, 'basic20', '1_exercises.json', {
      id: 'basic20-practice1',
      title: 'Numbers from 11 to 20 — Practice 1',
      evaluation: false,
      difficulty: 0,
      pages: [
        {
          items: [
            {
              id: '1',
              type: 'missingNumbers',
              start: 14,
              length: 3,
              missingIndices: [3],
            },
          ],
        },
      ],
    })

    assert.throws(
      () => buildManifestForTopic({ topic: 'algebra', levels: [{ slug: 'basic20', title: 'Numbers from 11 to 20' }] }, root),
      /missingNumbers\.missingIndices must stay within the sequence length/,
    )
  })
})

test('buildManifestForTopic rejects duplicate item ids in an exercise', () => {
  withTempContent((root) => {
    writeExercise(root, 'basic20', '1_exercises.json', {
      id: 'basic20-practice1',
      title: 'Numbers from 11 to 20 — Practice 1',
      evaluation: false,
      difficulty: 0,
      pages: [
        {
          items: [
            { id: '1', type: 'counting', countingElement: '🍎', result: 11 },
            { id: '1', type: 'counting', countingElement: '🍓', result: 12 },
          ],
        },
      ],
    })

    assert.throws(
      () => buildManifestForTopic({ topic: 'algebra', levels: [{ slug: 'basic20', title: 'Numbers from 11 to 20' }] }, root),
      /duplicate item id "1"/,
    )
  })
})
