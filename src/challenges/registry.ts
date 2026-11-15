import { AreYouHuman } from './are-you-human'
import { CeoPartners } from './ceo-partners'
import { DuckPen } from './duck-pen'
import { MuffinChihuahua } from './muffin-chihuahua'
import { SlidePuzzle } from './slide-puzzle'
import { SmallestCircle } from './smallest-circle'
import { Integrate } from './integrate'
import { TypeText } from './type-text'
import type { ChallengeDefinition } from './types'

/**
 * Demo order. stupid-api is implemented but stays off, matching the source game.
 * Add it here when you want the finale in the sequence.
 */
export const challenges: ChallengeDefinition[] = [
  {
    id: 'type-text',
    title: 'Type the text you see',
    prompt: '',
    Component: TypeText,
  },
  {
    id: 'slide-puzzle',
    title: 'Slide to complete the puzzle',
    prompt: '',
    Component: SlidePuzzle,
  },
  {
    id: 'ceo-partners',
    title: "Select all of the CEO's business partners",
    prompt: '',
    Component: CeoPartners,
  },
  {
    id: 'smallest-circle',
    title: 'Click the smallest circle',
    prompt: '',
    Component: SmallestCircle,
  },
  {
    id: 'muffin-chihuahua',
    title: 'Select all chihuahuas',
    prompt: '',
    Component: MuffinChihuahua,
  },
  {
    id: 'integrate',
    title: 'Integrate (first 6 digits)',
    prompt: '',
    Component: Integrate,
  },
  {
    id: 'duck-pen',
    title: 'Put the escaped ducks back in the pen',
    prompt: '',
    Component: DuckPen,
  },
  {
    id: 'are-you-human',
    title: 'Are you human?',
    prompt: '',
    Component: AreYouHuman,
  },
]
