import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type FirstLetterDisco = Extract<ExerciseItem, { type: 'firstLetterDiscovery' }>


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

/** Display-only: teacher-authored HTML content, not a question. */
export default function FirstLetterDiscovery({ item }: ItemProps<FirstLetterDisco>) {
  const highlight = item.highlight ? item.highlight : 1;
  const prefix = item.word.slice(0, highlight);
  const suffix = item.word.slice(highlight); 
  return (
  
      <div className="item-box explanation">
        <button onClick={() => speakText(item.word, item.lang)} className="btn tts-button">🔊</button>

        <p><span className='illustrateLetterImage'>{item.emoji ? item.emoji : <img src={import.meta.env.BASE_URL+item.image} style={{ height: '64px' }} />}</span><span className='illustrateLetterWord'><strong>{prefix}</strong>{suffix}</span></p>
        {item.explanation && <p className='illustrateLetterExplanation'>{item.explanation}</p>}
      </div>
  )
}
