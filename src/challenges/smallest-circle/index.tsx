import { useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd, shuffle } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

/** Area the circles are scattered across; fits the ~316px content area of the default card. */
const FIELD_W = 316
const FIELD_H = 270
const BLOB = 84
const GAP = 8
const SIZES = [60, 52, 46, 40, 34, 28, 22]

type Spot = { x: number; y: number; r: number }

/** Random spot for a circle of radius r that doesn't touch any already placed. */
function randomSpot(r: number, placed: Spot[]): Spot {
  let best: Spot = { x: FIELD_W / 2, y: FIELD_H / 2, r }
  let bestClearance = -Infinity
  for (let attempt = 0; attempt < 400; attempt++) {
    const spot = { x: rnd(r, FIELD_W - r), y: rnd(r, FIELD_H - r), r }
    const clearance = Math.min(
      Infinity,
      ...placed.map((o) => Math.hypot(o.x - spot.x, o.y - spot.y) - o.r - r),
    )
    if (clearance >= GAP) return spot
    // Keep the least-overlapping try in case the field is too crowded.
    if (clearance > bestClearance) {
      best = spot
      bestClearance = clearance
    }
  }
  return best
}

function layoutCircles() {
  const placed: Spot[] = []
  // The cover blob goes first since it's biggest; the tiny circle hides under it.
  const hidden = randomSpot(BLOB / 2, placed)
  placed.push(hidden)
  const circles = [{ x: hidden.x, y: hidden.y, size: 11, small: true }]
  for (const size of SIZES) {
    const spot = randomSpot(size / 2, placed)
    placed.push(spot)
    circles.push({ x: spot.x, y: spot.y, size, small: false })
  }
  return { circles: shuffle(circles), hidden }
}

function SmallestRound({ onPass, onFail }: RoundApi) {
  const [{ circles, hidden }] = useState(layoutCircles)
  const [blob, setBlob] = useState(() => ({
    x: hidden.x - BLOB / 2,
    y: hidden.y - BLOB / 2,
  }))
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null)

  return (
    <div className="circle-field">
      {circles.map((circle, index) => (
        <button
          key={index}
          type="button"
          className="circle-choice"
          aria-label="Circle"
          style={{
            width: circle.size,
            height: circle.size,
            left: circle.x - circle.size / 2,
            top: circle.y - circle.size / 2,
          }}
          onClick={() => (circle.small ? onPass() : onFail())}
        />
      ))}
      <div
        className="circle-blob"
        style={{ left: blob.x, top: blob.y }}
        onPointerDown={(event) => {
          drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: blob.x, y: blob.y }
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            // Ignore invalid pointer ids. The drag offset is already stored.
          }
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          setBlob({
            x: start.x + event.clientX - start.pointerX,
            y: start.y + event.clientY - start.pointerY,
          })
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      />
    </div>
  )
}

export function SmallestCircle(props: ChallengeProps) {
  return (
    <ChallengeRound prompt="Verification" title="Click the smallest circle" {...props}>
      {(api) => <SmallestRound {...api} />}
    </ChallengeRound>
  )
}
