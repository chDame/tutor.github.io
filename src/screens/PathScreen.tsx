import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TopicManifest } from '../types'
import { flattenManifest, computeExerciseStates, type ExerciseState } from '../utils/unlock'
import { getScores } from '../storage'
import { useAuth } from '../AuthContext'
import PathTrack from '../components/PathTrack'
import pathBackground from '../assets/path-background.png'

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
