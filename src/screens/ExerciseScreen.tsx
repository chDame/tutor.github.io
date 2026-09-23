import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ExerciseDoc, Score, TopicManifest } from '../types'
import { checkAnswer, isAnswerComplete, type AnswerInput } from '../utils/checkAnswer'
import { computeScore } from '../utils/scoring'
import { getScores, setScore } from '../storage'
import { flattenManifest, computeExerciseStates } from '../utils/unlock'
import { useAuth } from '../AuthContext'
import Celebration from '../components/Celebration'
import ExerciseItemView from '../components/exercise-items/ExerciseItemView'

export default function ExerciseScreen() {
  const { topic, levelSlug, fileName } = useParams<{ topic: string; levelSlug: string; fileName: string }>()
  const navigate = useNavigate()
  const { username } = useAuth()

  const [doc, setDoc] = useState<ExerciseDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({})
  const [result, setResult] = useState<{ score: Score; correct: number; total: number } | null>(null)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    setDoc(null)
    setError(null)
    setPageIndex(0)
    setAnswers({})
    setResult(null)

    const expectedFile = `${levelSlug}/${fileName}`

    fetch(`${import.meta.env.BASE_URL}content/${topic}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((manifest: TopicManifest) => {
        const flat = flattenManifest(manifest)
        const scores = getScores(username!)
        const states = computeExerciseStates(flat, scores)
        const target = states.find((s) => s.file === expectedFile)
        if (!target || !target.unlocked) {
          throw new Error('locked')
        }
        return fetch(`${import.meta.env.BASE_URL}content/${topic}/${expectedFile}`)
      })
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data: ExerciseDoc) => {
        setDoc(data)
        startRef.current = Date.now()
      })
      .catch((err) => {
        setError(err.message === 'locked' ? 'This exercise is locked — complete earlier ones first.' : 'Could not load this exercise.')
      })
  }, [topic, levelSlug, fileName, username])

  const allItems = useMemo(() => doc?.pages.flatMap((p) => p.items) ?? [], [doc])

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate(`/path/${topic}`)}>
          Back to path
        </button>
      </div>
    )
  }
  if (!doc) return <p>Loading…</p>

  if (result) {
    return (
      <div className="result-screen">
        <Celebration score={result.score} />
        <h2>{result.score >= 4 ? 'Great job! 🎉' : result.score >= 2 ? 'Well done!' : 'Keep practicing!'}</h2>
        <div className="stars">{'★'.repeat(result.score)}{'☆'.repeat(5 - result.score)}</div>
        <p className="result-detail">
          {result.correct} / {result.total} correct — score {result.score}/5
        </p>
        <button className="btn" onClick={() => navigate(`/path/${topic}`)}>
          Back to path
        </button>
      </div>
    )
  }

  const page = doc.pages[pageIndex]
  const isLastPage = pageIndex === doc.pages.length - 1
  const isFirstPage = pageIndex === 0
  const pageComplete = page.items.every((item) => isAnswerComplete(item, answers[item.id] ?? {}))

  function updateAnswer(itemId: string, patch: AnswerInput) {
    setAnswers((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  function handleNext() {
    if (!isLastPage) {
      setPageIndex((p) => p + 1)
      return
    }
    const total = allItems.length
    const correct = allItems.filter((item) => checkAnswer(item, answers[item.id] ?? {})).length
    const elapsedMs = Date.now() - startRef.current
    const score = computeScore(correct, total, elapsedMs)
    setScore(username!, doc!.id, score)
    setResult({ score, correct, total })
  }
  function handlePrevious() {
    if (!isFirstPage) {
      setPageIndex((p) => p - 1)
    }
  }

  return (
    <div>
      <div className="exercise-header">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((pageIndex + 1) / doc.pages.length) * 100}%` }}
          />
        </div>
        <span>
          {pageIndex + 1} / {doc.pages.length}
        </span>
      </div>
      <h2>{doc.title}</h2>
      <div className="page-grid">
        {page.items.map((item) => (
          <ExerciseItemView
            key={item.id}
            item={item}
            answer={answers[item.id] ?? {}}
            onChange={(patch) => updateAnswer(item.id, patch)}
          />
        ))}
      </div>
      <div className="exercise-footer">
        {!isFirstPage ? (
          <button className="btn" onClick={handlePrevious}>
            Previous
          </button>
        ) : (<></>)}
          <button className="btn" onClick={handleNext}>
            {isLastPage ? 'Finish' : 'Next'}
          </button>
        
      </div>
    </div>
  )
}
