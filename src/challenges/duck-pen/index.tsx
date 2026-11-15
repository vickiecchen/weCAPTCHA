import { useEffect, useRef, useState } from 'react'
import { Puzzle } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import fieldUrl from './assets/field.jpg'
import hamsterUrl from './assets/hamster.png'
import './styles.css'

const HAMSTERS = 12
/** Matches cropped hamster.png aspect (~284×327) to avoid empty hitbox padding. */
const SIZE_W = 44
const SIZE_H = 51
const HIT_X = SIZE_W / 2
const HIT_Y = SIZE_H / 2

type Hamster = {
  el: HTMLImageElement
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
  const [inPen, setInPen] = useState(HAMSTERS)
  onPassRef.current = onPass

  useEffect(() => {
    const pond = pondRef.current
    if (!pond) return

    const hamsters: Hamster[] = []
    const timers: number[] = []
    let frame = 0
    let penned = 0
    let solved = false

    const pen = () => pond.getBoundingClientRect()
    const inside = (x: number, y: number) => {
      const rect = pen()
      return x > rect.left + 4 && x < rect.right - 4 && y > rect.top + 4 && y < rect.bottom - 4
    }
    const wander = (hamster: Hamster) => {
      const angle = Math.random() * Math.PI * 2
      hamster.spd = (0.5 + Math.random() * 1.3) * (hamster.penned ? 0.35 : 1)
      hamster.vx = Math.cos(angle) * hamster.spd
      hamster.vy = Math.sin(angle) * hamster.spd
    }
    const place = (hamster: Hamster) => {
      hamster.el.style.left = `${hamster.x}px`
      hamster.el.style.top = `${hamster.y}px`
      hamster.el.style.transform = `scaleX(${hamster.vx < 0 ? -1 : 1})`
    }

    for (let i = 0; i < HAMSTERS; i++) {
      const el = document.createElement('img')
      el.className = 'duck-pen-duck'
      el.src = hamsterUrl
      el.alt = 'Hamster'
      el.draggable = false
      el.width = SIZE_W
      el.height = SIZE_H
      const rect = pen()
      const hamster: Hamster = {
        el,
        x: rnd(rect.left + 10, rect.right - SIZE_W - 10),
        y: rnd(rect.top + 10, rect.bottom - SIZE_H - 10),
        penned: true,
        escaped: false,
        drag: null,
        vx: 0,
        vy: 0,
        spd: 0,
      }
      penned += 1
      wander(hamster)
      timers.push(
        window.setTimeout(() => {
          if (!hamster.penned || hamster.drag) return
          hamster.penned = false
          hamster.escaped = true
          penned -= 1
          setInPen(penned)
          const current = pen()
          const angle =
            Math.atan2(
              hamster.y + HIT_Y - (current.top + current.height / 2),
              hamster.x + HIT_X - (current.left + current.width / 2),
            ) + (Math.random() - 0.5)
          hamster.spd = 1 + Math.random() * 1.4
          hamster.vx = Math.cos(angle) * hamster.spd
          hamster.vy = Math.sin(angle) * hamster.spd
        }, 500 + i * 260 + rnd(0, 200)),
      )
      el.onpointerdown = (event) => {
        event.preventDefault()
        el.setPointerCapture(event.pointerId)
        hamster.drag = [event.clientX - hamster.x, event.clientY - hamster.y]
        hamster.escaped = true
        if (hamster.penned) {
          hamster.penned = false
          penned -= 1
          setInPen(penned)
        }
        el.style.cursor = 'grabbing'
        el.style.zIndex = '60'
      }
      el.onpointermove = (event) => {
        if (!hamster.drag) return
        hamster.x = event.clientX - hamster.drag[0]
        hamster.y = event.clientY - hamster.drag[1]
      }
      const release = () => {
        if (!hamster.drag) return
        hamster.drag = null
        el.style.cursor = 'grab'
        el.style.zIndex = '50'
        if (inside(hamster.x + HIT_X, hamster.y + HIT_Y)) {
          hamster.penned = true
          penned += 1
          wander(hamster)
          setInPen(penned)
          if (!solved && penned === HAMSTERS && hamsters.every((item) => item.escaped)) {
            solved = true
            onPassRef.current()
          }
        } else {
          wander(hamster)
        }
      }
      el.onpointerup = release
      el.onpointercancel = release
      document.body.append(el)
      hamsters.push(hamster)
    }
    setInPen(penned)

    const tick = () => {
      if (solved) return
      const rect = pen()
      for (const hamster of hamsters) {
        if (!hamster.drag) {
          if (Math.random() < 0.012) wander(hamster)
          hamster.x += hamster.vx
          hamster.y += hamster.vy
          if (hamster.penned) {
            if (hamster.x < rect.left + 3 || hamster.x > rect.right - SIZE_W - 3) hamster.vx *= -1
            if (hamster.y < rect.top + 3 || hamster.y > rect.bottom - SIZE_H - 3) hamster.vy *= -1
            hamster.x = clamp(hamster.x, rect.left + 3, rect.right - SIZE_W - 3)
            hamster.y = clamp(hamster.y, rect.top + 3, rect.bottom - SIZE_H - 3)
          } else {
            if (hamster.x < 0 || hamster.x > window.innerWidth - SIZE_W) hamster.vx *= -1
            if (hamster.y < 0 || hamster.y > window.innerHeight - SIZE_H) hamster.vy *= -1
            hamster.x = clamp(hamster.x, 0, window.innerWidth - SIZE_W)
            hamster.y = clamp(hamster.y, 0, window.innerHeight - SIZE_H)
          }
        }
        place(hamster)
      }
      frame = window.requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
      hamsters.forEach((hamster) => hamster.el.remove())
    }
  }, [])

  return (
    <Puzzle prompt="Verification" title="Put the escaped hamsters back in the pen">
      <div className="duck-pen-panel">
        <p className="big">
          In the pen: {inPen}/{HAMSTERS}
        </p>
        <div
          className="duck-pond"
          ref={pondRef}
          style={{ backgroundImage: `url(${fieldUrl})` }}
        />
        <p className="hint">Drag each hamster back into the pen.</p>
      </div>
    </Puzzle>
  )
}
