import type { ChallengeDefinition } from './types'
import { placeholderChallenges } from './placeholders'

/**
 * Single place to plug teammate challenges in.
 * Keep order = demo order. Swap a Component; leave id/title/prompt as needed.
 */
export const challenges: ChallengeDefinition[] = placeholderChallenges
