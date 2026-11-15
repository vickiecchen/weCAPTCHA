import type { ComponentType } from 'react'

/** Contract every challenge must implement so the shell can sequence them. */
export type ChallengeProps = {
  onPass: () => void
  /** Wrong attempt — shell prompts retry; no lockout. */
  onFail: () => void
}

export type ChallengeDefinition = {
  id: string
  title: string
  /** Short line shown above the challenge panel */
  prompt: string
  Component: ComponentType<ChallengeProps>
}
