import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type FirstLetter = Extract<ExerciseItem, { type: 'firstLetter' }>

  function speakText(text: string, lang: string) {
    // Check if text is provided
    if (!text.trim()) return;

    // Create a new SpeechSynthesisUtterance instance
    const utterance = new SpeechSynthesisUtterance(text);

    // Optional: Customize properties
    utterance.rate = 1.0; // Speed (0.1 to 10)
    utterance.pitch = 1.0; // Pitch (0 to 2)

    // Pass the utterance to the global speech synthesis controller
    window.speechSynthesis.speak(utterance);
  }

export default function FirstLetterItem({ item, answer, onChange }: ItemProps<FirstLetter>) {
  return (
    <div className="item-box first-letter">
      <button onClick={() => speakText(item.result + item.wordSuffix, item.lang)} className="btn tts-button">🔊</button>
      <div className="first-letter-prompt">
        <span className='illustrateLetterImage'>{item.emoji ? item.emoji : <img src={import.meta.env.BASE_URL+item.image} style={{ height: '64px' }} />}</span>
        <span className="item-inputs">
          <input
            maxLength={item.result.length}
            value={answer.value ?? ''}
            onChange={(e) => onChange({ value: e.target.value })}
            aria-label="Type the missing first letter for this word"
          />
        </span>
        <span>{item.wordSuffix}</span>
      </div>
    </div>
  )
}
