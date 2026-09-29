import FireworksCanvas from './FireworksCanvas'
import type { Medal } from '../utils/beatTheClock'

/** Beat the Clock has its own two-state celebration, separate from the normal 0-5 score system. */
export default function BeatTheClockCelebration({ medal }: { medal: Medal }) {
  if (medal) {
    return (
      <div className="fireworks-panel">
        <FireworksCanvas />
        <img
          src={`${import.meta.env.BASE_URL}brainRocket.gif`}
          alt="Brain riding a rocket"
          className="fireworks-brain-foreground"
        />
      </div>
    )
  }

  return (
    <div className="celebration brain-gym">
      <div className="brain-panel">
        <img src={`${import.meta.env.BASE_URL}brainRocketCrashed.png`} alt="Brain's rocket crashed" />
      </div>
    </div>
  )
}
