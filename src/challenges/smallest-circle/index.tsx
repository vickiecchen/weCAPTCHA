import { useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd, shuffle } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

/** Positions fit the ~316px content area of the default puzzle card. */
const COLUMNS = [40, 112, 184, 256]
const CENTER_Y = 150
const BLOB = 84

function layoutCircles() {
  const smallIndex = rnd(0, 3)
  const sizes = shuffle([54, 44, 34])
  let other = 0
  const circles = COLUMNS.map((x, index) => {
    const size = index === smallIndex ? 11 : (sizes[other++] ?? 34)
    return { x, size, small: index === smallIndex }
  })
  return { circles, smallIndex }
}

function SmallestRound({ onPass, onFail }: RoundApi) {
  const [{ circles, smallIndex }] = useState(layoutCircles)
  const [blob, setBlob] = useState(() => ({
    x: COLUMNS[smallIndex]! - BLOB / 2,
    y: CENTER_Y - BLOB / 2,
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
            top: CENTER_Y - circle.size / 2,
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
      >
        Sponsored
      </div>
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
