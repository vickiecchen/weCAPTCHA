import { useEffect, useRef, useState } from 'react'
import { beep } from '../beep'
import { Puzzle } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const DUCKS = 12

type Duck = {
  el: HTMLSpanElement
  x: number
  y: number
  penned: boolean
  escaped: boolean
  drag: [number, number] | null
  vx: number
  vy: number
  spd: number
}

function clamp(value: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, value))
}

export function DuckPen({ onPass }: ChallengeProps) {
  const pondRef = useRef<HTMLDivElement>(null)
  const onPassRef = useRef(onPass)
  const [inPen, setInPen] = useState(DUCKS)
  onPassRef.current = onPass

  useEffect(() => {
    const pond = pondRef.current
    if (!pond) return

    const ducks: Duck[] = []
    const timers: number[] = []
    let frame = 0
    let penned = 0
    let solved = false

    const pen = () => pond.getBoundingClientRect()
    const inside = (x: number, y: number) => {
      const rect = pen()
      return x > rect.left + 4 && x < rect.right - 4 && y > rect.top + 4 && y < rect.bottom - 4
    }
    const wander = (duck: Duck) => {
      const angle = Math.random() * Math.PI * 2
      duck.spd = (0.5 + Math.random() * 1.3) * (duck.penned ? 0.35 : 1)
      duck.vx = Math.cos(angle) * duck.spd
      duck.vy = Math.sin(angle) * duck.spd
    }
    const place = (duck: Duck) => {
      duck.el.style.left = `${duck.x}px`
      duck.el.style.top = `${duck.y}px`
      duck.el.style.transform = `scaleX(${duck.vx < 0 ? -1 : 1})`
    }

    for (let i = 0; i < DUCKS; i++) {
      const el = document.createElement('span')
      el.className = 'duck-pen-duck'
      el.textContent = '🦆'
      const rect = pen()
      const duck: Duck = {
        el,
        x: rnd(rect.left + 10, rect.right - 50),
        y: rnd(rect.top + 10, rect.bottom - 50),
        penned: true,
        escaped: false,
        drag: null,
        vx: 0,
        vy: 0,
        spd: 0,
      }
      penned += 1
      wander(duck)
      timers.push(
        window.setTimeout(() => {
          if (!duck.penned || duck.drag) return
          duck.penned = false
          duck.escaped = true
          penned -= 1
          setInPen(penned)
          const current = pen()
          const angle =
            Math.atan2(duck.y + 20 - (current.top + current.height / 2), duck.x + 20 - (current.left + current.width / 2)) +
            (Math.random() - 0.5)
          duck.spd = 1 + Math.random() * 1.4
          duck.vx = Math.cos(angle) * duck.spd
          duck.vy = Math.sin(angle) * duck.spd
          beep(300 + i * 30, 0.05)
        }, 500 + i * 260 + rnd(0, 200)),
      )
      el.onpointerdown = (event) => {
        event.preventDefault()
        el.setPointerCapture(event.pointerId)
        duck.drag = [event.clientX - duck.x, event.clientY - duck.y]
        duck.escaped = true
        if (duck.penned) {
          duck.penned = false
          penned -= 1
          setInPen(penned)
        }
        el.style.cursor = 'grabbing'
        el.style.zIndex = '60'
        beep(520, 0.04)
      }
      el.onpointermove = (event) => {
        if (!duck.drag) return
        duck.x = event.clientX - duck.drag[0]
        duck.y = event.clientY - duck.drag[1]
      }
      const release = () => {
        if (!duck.drag) return
        duck.drag = null
        el.style.cursor = 'grab'
        el.style.zIndex = '50'
        if (inside(duck.x + 20, duck.y + 20)) {
          duck.penned = true
          penned += 1
          wander(duck)
          beep(700, 0.06)
          setInPen(penned)
          if (!solved && penned === DUCKS && ducks.every((item) => item.escaped)) {
            solved = true
            beep(880, 0.12)
            onPassRef.current()
          }
        } else {
          wander(duck)
        }
      }
      el.onpointerup = release
      el.onpointercancel = release
      document.body.append(el)
      ducks.push(duck)
    }
    setInPen(penned)

    const tick = () => {
      if (solved) return
      const rect = pen()
      for (const duck of ducks) {
        if (!duck.drag) {
          if (Math.random() < 0.012) wander(duck)
          duck.x += duck.vx
          duck.y += duck.vy
          if (duck.penned) {
            if (duck.x < rect.left + 3 || duck.x > rect.right - 43) duck.vx *= -1
            if (duck.y < rect.top + 3 || duck.y > rect.bottom - 43) duck.vy *= -1
            duck.x = clamp(duck.x, rect.left + 3, rect.right - 43)
            duck.y = clamp(duck.y, rect.top + 3, rect.bottom - 43)
          } else {
            if (duck.x < 0 || duck.x > window.innerWidth - 40) duck.vx *= -1
            if (duck.y < 0 || duck.y > window.innerHeight - 40) duck.vy *= -1
            duck.x = clamp(duck.x, 0, window.innerWidth - 40)
            duck.y = clamp(duck.y, 0, window.innerHeight - 40)
          }
        }
        place(duck)
      }
      frame = window.requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
      ducks.forEach((duck) => duck.el.remove())
    }
  }, [])

  return (
    <Puzzle title="Put the escaped ducks back in the pen">
      <p className="big">In the pen: {inPen}/{DUCKS}</p>
      <div className="duck-pond" ref={pondRef}>
        <div className="duck-pen-label">DUCK PEN</div>
      </div>
      <p className="hint">Drag each duck back into the pen.</p>
    </Puzzle>
  )
}
