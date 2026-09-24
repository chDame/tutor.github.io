import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TopicManifest } from '../types'
import { flattenManifest, computeExerciseStates, type ExerciseState } from '../utils/unlock'
import { getScores } from '../storage'
import { useAuth } from '../AuthContext'
import PathTrack from '../components/PathTrack'
import pathBackground from '../assets/path-background.png'

function computeNextPendingId(manifest: TopicManifest, username: string): string | null {
  const states = computeExerciseStates(flattenManifest(manifest), getScores(username))
  const pending = states.filter((s) => s.unlocked && !s.completed)
  if (pending.length === 0) return null
  // Any number of earlier, previously-skipped exercises can be unlocked now too —
  // scroll to the furthest one reached (the actual frontier), not the earliest
  // available. Prefer the furthest non-shortcut exercise over a distant
  // validation shortcut, which is a bonus target rather than "next up".
  const nonShortcut = pending.filter((s) => !s.isNextValidation)
  const target = nonShortcut.length > 0 ? nonShortcut[nonShortcut.length - 1] : pending[pending.length - 1]
  return target.id
}

export default function PathScreen() {
  const { topic } = useParams<{ topic: string }>()
  const navigate = useNavigate()
  const { username } = useAuth()
  const [manifest, setManifest] = useState<TopicManifest | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setManifest(null)
    setError(null)
    fetch(`${import.meta.env.BASE_URL}content/${topic}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(setManifest)
      .catch(() => setError('Could not load this topic yet.'))
  }, [topic])

  const nextPendingId = manifest ? computeNextPendingId(manifest, username!) : null

  useEffect(() => {
    if (!nextPendingId) return
    document.getElementById(`exercise-node-${nextPendingId}`)?.scrollIntoView({ block: 'center' })
  }, [nextPendingId])

  if (error) return <p>{error}</p>
  if (!manifest) return <p>Loading…</p>

  const flat = flattenManifest(manifest)
  const scores = getScores(username!)
  const states = computeExerciseStates(flat, scores)

  const byLevel = new Map<string, ExerciseState[]>()
  for (const s of states) {
    if (!byLevel.has(s.levelSlug)) byLevel.set(s.levelSlug, [])
    byLevel.get(s.levelSlug)!.push(s)
  }

  return (
    <div>
      <h1>{manifest.topic}</h1>
      <div className="path-page" style={{ backgroundImage: `url(${pathBackground})` }}>
        {[...byLevel.entries()].map(([levelSlug, exercises]) => (
          <div className="level-group" key={levelSlug}>
            <div className="level-title">{exercises[0].levelTitle}</div>
            <PathTrack
              exercises={exercises}
              onSelect={(ex) => {
                const fileName = ex.file.split('/').pop()!
                navigate(`/exercise/${topic}/${ex.levelSlug}/${fileName}`)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
