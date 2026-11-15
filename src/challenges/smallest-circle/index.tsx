import { useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd, shuffle } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const COLUMNS = [45, 125, 205, 285]
const CENTER_Y = 180

function layoutCircles() {
  const smallIndex = rnd(0, 3)
  const sizes = shuffle([64, 52, 40])
  let other = 0
  const circles = COLUMNS.map((x, index) => {
    const size = index === smallIndex ? 12 : (sizes[other++] ?? 40)
    return { x, size, small: index === smallIndex }
  })
  return { circles, smallIndex }
}

function SmallestRound({ onPass, onFail }: RoundApi) {
  const [{ circles, smallIndex }] = useState(layoutCircles)
  const [blob, setBlob] = useState(() => ({
    x: COLUMNS[smallIndex]! - 48,
    y: CENTER_Y - 48,
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
    <ChallengeRound title="Click the smallest circle" {...props}>
      {(api) => <SmallestRound {...api} />}
    </ChallengeRound>
  )
}
