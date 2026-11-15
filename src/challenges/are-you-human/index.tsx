import { useRef, useState } from 'react'
import { Puzzle } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const PROMPTS = [
  ['Are you human?', "I'm not a robot"],
  ['Are you sure?', "Yes I'm sure"],
  ['Are you sure sure?', 'Yes. Sure sure.'],
  ['Really? Look me in the eye.', "I'm. Not. A. Robot."],
] as const

const DODGE_LIMITS = [3, 5, 7, 10]

function randomSpot() {
  return { x: rnd(0, 100), y: rnd(40, 200) }
}

export function AreYouHuman({ onPass }: ChallengeProps) {
  const [stage, setStage] = useState(0)
  const [scale, setScale] = useState(1)
  const [spot, setSpot] = useState(randomSpot)
  const dodges = useRef(0)
  const solved = useRef(false)
  const prompt = PROMPTS[stage] ?? PROMPTS[0]
  const limit = DODGE_LIMITS[stage] ?? 10

  function dodge() {
    if (dodges.current >= limit) return
    dodges.current += 1
    setScale((current) => current * 0.93)
    setSpot(randomSpot())
  }

  function click() {
    if (dodges.current < limit) {
      dodge()
      return
    }
    if (stage + 1 >= PROMPTS.length) {
      if (solved.current) return
      solved.current = true
      onPass()
      return
    }
    dodges.current = 0
    setStage(stage + 1)
    setScale(1)
    setSpot(randomSpot())
  }

  return (
    <Puzzle prompt="Verification" title={prompt[0]}>
      <div className="human-panel">
        <div className="human-field">
          <button
            type="button"
            className="human-box"
            style={{ left: spot.x, top: spot.y, transform: `scale(${scale})` }}
            onPointerEnter={dodge}
            onClick={click}
          >
            <span className="human-check" />
            <span>{prompt[1]}</span>
          </button>
        </div>
      </div>
    </Puzzle>
  )
}
