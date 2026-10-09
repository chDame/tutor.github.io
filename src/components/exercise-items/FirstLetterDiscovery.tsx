import type { ReactNode } from 'react'
import type { ExerciseItem } from '../../types'
import type { ItemProps } from './common'

type FirstLetterDisco = Extract<ExerciseItem, { type: 'firstLetterDiscovery' }>

function renderHighlightedWord(word: string, highlight: number[] | null | undefined): ReactNode[] {
  const highlighted = new Set(highlight ?? [])
  const parts: ReactNode[] = []
  let i = 0
  while (i < word.length) {
    const isHighlighted = highlighted.has(i)
    let j = i
    while (j < word.length && highlighted.has(j) === isHighlighted) j++
    const chunk = word.slice(i, j)
    parts.push(isHighlighted ? <strong key={i}>{chunk}</strong> : chunk)
    i = j
  }
  return parts
}

  function speakText(text: string, lang: string) {
    // Check if text is provided
    if (!text.trim()) return;

    // Create a new SpeechSynthesisUtterance instance
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = lang;
    // Optional: Customize properties
    utterance.rate = 0.7; // Speed (0.1 to 10)
    utterance.pitch = 0.9; // Pitch (0 to 2)

    // Pass the utterance to the global speech synthesis controller
    window.speechSynthesis.speak(utterance);
  }

/** Display-only: teacher-authored HTML content, not a question. */
export default function FirstLetterDiscovery({ item }: ItemProps<FirstLetterDisco>) {
  const wordParts = renderHighlightedWord(item.word, item.highlight);
  return (

      <div className="item-box explanation">
        <button onClick={() => speakText(item.speaks ? item.speaks : item.word, item.lang)} className="btn tts-button">🔊</button>

        <p><span className='illustrateLetterImage'>{item.emoji ? item.emoji : item.image ? <img src={import.meta.env.BASE_URL+item.image} style={{ height: '64px' }} /> : <></>}</span><span className='illustrateLetterWord'>{wordParts}</span></p>
        {item.explanation && <p className='illustrateLetterExplanation'>{item.explanation}</p>}
      </div>
  )
}
