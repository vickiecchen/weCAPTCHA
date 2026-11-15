/** Stand-in puzzles from the shell scaffold. The live sequence is registry.ts. */
import type { ChallengeDefinition, ChallengeProps } from './types'

function CheckboxChallenge({ onPass, onFail }: ChallengeProps) {
  return (
    <label className="puzzle-checkbox">
      <input
        type="checkbox"
        onChange={(e) => {
          if (e.target.checked) onPass()
          else onFail()
        }}
      />
      <span>I am not a robot</span>
    </label>
  )
}

function ComingSoonChallenge({ onPass, onFail }: ChallengeProps) {
  return (
    <div className="puzzle-placeholder">
      <button type="button" onClick={onPass}>
        Pass
      </button>
      <button type="button" onClick={onFail}>
        Retry
      </button>
    </div>
  )
}

/** Replace / extend these with real challenges — same props, drop into registry. */
export const placeholderChallenges: ChallengeDefinition[] = [
  {
    id: 'checkbox',
    title: 'Step 1',
    prompt: '',
    Component: CheckboxChallenge,
  },
  {
    id: 'challenge-2',
    title: 'Step 2',
    prompt: '',
    Component: ComingSoonChallenge,
  },
  {
    id: 'challenge-3',
    title: 'Step 3',
    prompt: '',
    Component: ComingSoonChallenge,
  },
]
