import { useEffect, useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { shuffle } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const OBJECTS = [
  { id: 'squirrel', emoji: '🐿️', weight: 0.5 },
  { id: 'pear', emoji: '🍐', weight: 0.2 },
] as const

function HeavierRound({ onPass, onFail }: RoundApi) {
  const [sides] = useState(() => shuffle(OBJECTS))
  const heavier = sides[0].weight > sides[1].weight ? 0 : 1
  const [tilt, setTilt] = useState(0)
  const busy = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function choose(index: number) {
    if (busy.current) return
    busy.current = true
    setTilt(heavier === 1 ? 9 : -9)
    timer.current = window.setTimeout(() => {
      if (index === heavier) onPass()
      else onFail()
    }, 650)
  }

  return (
    <>
      <div className="big">Click the object that would tip the scale</div>
      <div className="scale-row">
        {sides.map((object, index) => (
          <button
            key={object.id}
            type="button"
            className="scale-object"
            aria-label={object.id === 'squirrel' ? 'Squirrel' : 'Pear'}
            onClick={() => choose(index)}
          >
            {object.emoji}
          </button>
        ))}
      </div>
      <div className="scale-beam" style={{ transform: `rotate(${tilt}deg)` }} />
      <div className="scale-base" />
    </>
  )
}

export function WhichHeavier(props: ChallengeProps) {
  return (
    <ChallengeRound prompt="Verification" title="Click the object that would tip the scale" {...props}>
      {(api) => <HeavierRound {...api} />}
    </ChallengeRound>
  )
}
