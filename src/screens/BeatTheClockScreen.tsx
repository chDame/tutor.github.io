import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { BeatTheClockConfig, ExerciseItem, TopicManifest } from '../types'
import { checkAnswer, isAnswerComplete, type AnswerInput } from '../utils/checkAnswer'
import { flattenManifest, computeExerciseStates } from '../utils/unlock'
import { getScores } from '../storage'
import { useAuth } from '../AuthContext'
import { generateBeatTheClockItems, computeMedal, type Medal } from '../utils/beatTheClock'
import BeatTheClockCelebration from '../components/BeatTheClockCelebration'
import ExerciseItemView from '../components/exercise-items/ExerciseItemView'

const MEDAL_LABEL: Record<NonNullable<Medal>, string> = { gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' }

function formatSeconds(s: number): string {
  return `${s.toFixed(1)}s`
}

export default function BeatTheClockScreen() {
  const { topic, levelSlug, fileName } = useParams<{ topic: string; levelSlug: string; fileName: string }>()
  const navigate = useNavigate()
  const { username } = useAuth()

  const [config, setConfig] = useState<BeatTheClockConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ExerciseItem[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({})
  const [result, setResult] = useState<{ elapsedSeconds: number; medal: Medal; mistakeIds: string[] } | null>(null)
  const [resolvedMistakes, setResolvedMistakes] = useState<Set<string>>(new Set())
  const [retryFeedback, setRetryFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({})
  const startRef = useRef<number>(Date.now())
  const pageGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConfig(null)
    setError(null)

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
        if (!target || !target.unlocked) throw new Error('locked')
        if (!target.beatTheClock) throw new Error('not found')
        setConfig(target.beatTheClock)
      })
      .catch((err) => {
        setError(err.message === 'locked' ? 'This exercise is locked — complete earlier ones first.' : 'Could not load this challenge.')
      })
  }, [topic, levelSlug, fileName, username])

  function startRound(cfg: BeatTheClockConfig) {
    const generated = generateBeatTheClockItems(cfg)
    generated.forEach((item, i) => {
      item.id = String(i)
    })
    setItems(generated)
    setPageIndex(0)
    setAnswers({})
    setResult(null)
    setResolvedMistakes(new Set())
    setRetryFeedback({})
    startRef.current = Date.now()
  }

  useEffect(() => {
    if (config) startRound(config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    if (result) return
    const container = pageGridRef.current
    if (!container) return
    const firstInput = container.querySelector<HTMLInputElement>('input, textarea')
    if (firstInput) {
      firstInput.focus()
    } else {
      container.focus()
    }
  }, [items, result, pageIndex])

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
  if (!config || items.length === 0) return <p>Loading…</p>

  function updateAnswer(itemId: string, patch: AnswerInput) {
    setAnswers((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  function handleCheckMistake(itemId: string) {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const isCorrect = checkAnswer(item, answers[itemId] ?? {})
    setRetryFeedback((prev) => ({ ...prev, [itemId]: isCorrect ? 'correct' : 'incorrect' }))
    if (isCorrect) setResolvedMistakes((prev) => new Set(prev).add(itemId))
  }

  function handleNext() {
    const isLastPage = pageIndex === items.length - 1
    if (!isLastPage) {
      setPageIndex((p) => p + 1)
      return
    }
    const elapsedSeconds = (Date.now() - startRef.current) / 1000
    const mistakeIds = items.filter((item) => !checkAnswer(item, answers[item.id] ?? {})).map((item) => item.id)
    const medal = mistakeIds.length > 0 ? null : computeMedal(elapsedSeconds, config!.times)
    setResult({ elapsedSeconds, medal, mistakeIds })
  }

  if (result) {
    const allResolved = result.mistakeIds.every((id) => resolvedMistakes.has(id))

    return (
      <div className="result-screen">
        <BeatTheClockCelebration medal={result.medal} />
        <h2>{result.medal ? `${MEDAL_LABEL[result.medal]} medal!` : result.mistakeIds.length > 0 ? "Oh no! You've made mistakes! Review them and try again" : "You've failed to beat the clock but you can try again."}</h2>
        <p className="result-detail">Your time: {formatSeconds(result.elapsedSeconds)}</p>
        <div className="beat-the-clock-objectives">
          <span>🥇 ≤ {config.times[0]}s</span>
          <span>🥈 ≤ {config.times[1]}s</span>
          <span>🥉 ≤ {config.times[2]}s</span>
        </div>
        {result.mistakeIds.length > 0 && !allResolved && (
          <div className="mistakes-review">
            <h3>Review your mistakes</h3>
            {result.mistakeIds.map((id) => {
              const item = items.find((i) => i.id === id)
              if (!item) return null
              if (resolvedMistakes.has(id)) {
                return (
                  <div className="mistake-row resolved" key={id}>
                    ✅ Well done!
                  </div>
                )
              }
              return (
                <div className="mistake-row" key={id}>
                  <ExerciseItemView item={item} answer={answers[id] ?? {}} onChange={(patch) => updateAnswer(id, patch)} />
                  <div className="mistake-actions">
                    <button className="btn-secondary" onClick={() => handleCheckMistake(id)}>
                      Check
                    </button>
                    {retryFeedback[id] === 'incorrect' && <span className="mistake-feedback">Give it another try</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="exercise-footer">
          <button className="btn-secondary" onClick={() => startRound(config!)}>
            Retry
          </button>
          <button className="btn" onClick={() => navigate(`/path/${topic}`)}>
            Back to path
          </button>
        </div>
      </div>
    )
  }

  const item = items[pageIndex]
  const isLastPage = pageIndex === items.length - 1
  const pageComplete = isAnswerComplete(item, answers[item.id] ?? {})

  function handlePageKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Enter') return
    const inputs = Array.from(pageGridRef.current?.querySelectorAll<HTMLInputElement>('input, textarea') ?? [])
    if (inputs.length === 0) {
      if (pageComplete) {
        e.preventDefault()
        handleNext()
      }
      return
    }
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return
    e.preventDefault()
    const idx = inputs.indexOf(target as HTMLInputElement)
    if (idx === -1) return
    if (idx < inputs.length - 1) {
      inputs[idx + 1].focus()
    } else if (pageComplete) {
      handleNext()
    }
  }

  return (
    <div>
      <div className="exercise-header">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${((pageIndex + 1) / items.length) * 100}%` }} />
        </div>
        <span>
          {pageIndex + 1} / {items.length}
        </span>
      </div>
      <h2>⏱️ Beat the Clock</h2>
      <div className="page-grid" ref={pageGridRef} tabIndex={-1} onKeyDown={handlePageKeyDown}>
        <ExerciseItemView item={item} answer={answers[item.id] ?? {}} onChange={(patch) => updateAnswer(item.id, patch)} />
      </div>
      <div className="exercise-footer">
        <button className="btn" disabled={!pageComplete} onClick={handleNext}>
          {isLastPage ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
