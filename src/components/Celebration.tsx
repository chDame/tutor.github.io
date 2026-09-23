import type { Score } from '../types'
import FireworksCanvas from './FireworksCanvas'

const BALLOON_EMOJI = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈']

function Balloons() {
  return (
    <div className="celebration balloons">
      {BALLOON_EMOJI.map((e, i) => (
        <span key={i} className="balloon" style={{ left: `${(i * 97) % 100}%`, animationDelay: `${i * 0.4}s` }}>
          {e}
        </span>
      ))}
    </div>
  )
}

function BrainBenchPress() {
  return (
    <div className="celebration brain-gym">
      <div className="brain-rig">
        <span className="brain-head">🧠</span>
        <span className="brain-bar">💪</span>
      </div>
      <p className="brain-caption">Brain gains!</p>
    </div>
  )
}

function Fireworks() {
  return (
    <div className="fireworks-panel">
      <FireworksCanvas />
    </div>
  )
}

export default function Celebration({ score }: { score: Score }) {
  if (score === 3) return <Balloons />
  if (score === 4) return <BrainBenchPress />
  if (score === 5) return <Fireworks />
  return null
}
