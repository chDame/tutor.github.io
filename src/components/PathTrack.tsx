import type { ExerciseState } from '../utils/unlock'
import { starsForScore, bonusIcon, difficultyIcon } from '../utils/scoreVisual'

const TRACK_WIDTH = 300
const NODE_SIZE = 74
const ROW_HEIGHT = 120
const X_POSITIONS = [150, 80, 220] // center, left, right — cycled per node

interface Props {
  exercises: ExerciseState[]
  onSelect: (ex: ExerciseState) => void
}

export default function PathTrack({ exercises, onSelect }: Props) {
  const points = exercises.map((_, i) => ({
    x: X_POSITIONS[i % 3],
    y: i * ROW_HEIGHT + NODE_SIZE / 2,
  }))
  const height = (exercises.length - 1) * ROW_HEIGHT + NODE_SIZE + 40

  return (
    <div className="path-track" style={{ width: TRACK_WIDTH, height }}>
      <svg className="path-svg" width={TRACK_WIDTH} height={height} viewBox={`0 0 ${TRACK_WIDTH} ${height}`}>
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1]
          const achieved = exercises[i].completed
          const d = `M ${p.x} ${p.y} C ${p.x} ${p.y + ROW_HEIGHT / 2}, ${next.x} ${next.y - ROW_HEIGHT / 2}, ${next.x} ${next.y}`
          return (
            <path
              key={i}
              d={d}
              className={achieved ? 'path-line achieved' : 'path-line remaining'}
              fill="none"
            />
          )
        })}
      </svg>

      {exercises.map((ex, i) => {
        const p = points[i]
        const stars = ex.completed ? starsForScore(ex.score!) : 0
        const bonus = ex.completed ? bonusIcon(ex.score!) : null
        const diffIcon = difficultyIcon(ex.difficulty)
        const stateClass = ex.completed ? `completed score-${ex.score}` : ex.unlocked ? 'unlocked' : 'locked'

        return (
          <div
            key={ex.id}
            id={`exercise-node-${ex.id}`}
            className="path-node-abs"
            style={{ left: p.x - NODE_SIZE / 2, top: p.y - NODE_SIZE / 2 }}
          >
            <button
              className={`path-node ${stateClass} ${ex.isNextValidation ? 'validation-shortcut' : ''}`}
              disabled={!ex.unlocked}
              onClick={() => onSelect(ex)}
            >
              {ex.isNextValidation && <span className="shortcut-badge">Skip</span>}
              {ex.evaluation && <span className="checkpoint-badge">🏁</span>}
              {diffIcon && (
                <span className={`difficulty-badge ${ex.difficulty === 5 ? 'burning' : ''}`}>{diffIcon}</span>
              )}
              
              <span className="node-number">{ex.indexInLevel + 1}</span>
            {ex.character && (
              <img
                src={`${import.meta.env.BASE_URL}${ex.character.image}`}
                alt="character"
                className={`character character-${ex.character.position}`}
              />
            )}
            </button>
            {ex.completed ? 
            <span className={`node-stars node-stars-${stars}`}>
              {'★'.repeat(stars)}
              {'☆'.repeat(3 - stars)}
              {bonus && <span className="bonus-badge">{bonus}</span>}
            </span>
             :<> </>}
          </div>
        )
      })}
    </div>
  )
}
