import { useEffect, useRef, useState } from 'react'
import { Puzzle } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

/**
 * Finale from the source game. It never passes.
 * Left out of registry.ts on purpose — import { StupidApi } and add a registry
 * entry when you want it in the demo.
 */
const LINES = [
  () => `GET /api/v1/human?id=you  →  {"human":"maybe","confidence":${(Math.random() / 1000).toFixed(5)},"vibes":"off"}`,
  () => `POST /api/v1/captcha/verify  →  418 {"message":"I'm a teapot. You are not."}`,
  () => `{"solved":"kinda","next":"captcha/${rnd(10, 9999)}","after":"captcha/${rnd(10, 9999)}"}`,
  () => `{"error":"mouse movement was too confident"}`,
  () => `{"human":false,"reason":"blinked at the wrong time"}`,
  () => `{"latency":"-${rnd(5, 90)}ms","note":"we verified you before you asked"}`,
  () => `{"fingerprint":"smells like a robot","cookies":"stale"}`,
  () => `{"status":"NaN","retry_after":"yesterday"}`,
  () => `{"human_score":${rnd(-9, 9)},"required":"banana"}`,
  () => `{"message":"please prove you are human to prove you are human"}`,
  () => `GET /api/v1/sadness  →  200 {"your_attempt":"noted"}`,
]

export function StupidApi({ onPass, onFail }: ChallengeProps) {
  void onPass
  void onFail
  const termRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const nestRef = useRef<HTMLDivElement>(null)
  const [glitch, setGlitch] = useState(false)
  const [heading, setHeading] = useState('Verification 9 of ∞')

  useEffect(() => {
    const term = termRef.current
    const bar = barRef.current
    const status = statusRef.current
    const nest = nestRef.current
    if (!term || !bar || !status || !nest) return

    let requests = 1
    let percent = 0
    let depth = 0
    let tilt = 0
    let deepest = nest
    const buffer: string[] = []

    const feed = window.setInterval(() => {
      const line = LINES[rnd(0, LINES.length - 1)]
      if (!line) return
      buffer.push(`#${String(requests++).padStart(5, '0')} ${line()}`)
      if (buffer.length > 8) buffer.shift()
      term.textContent = buffer.join('\n')
      percent += rnd(3, 11)
      if (percent >= 99) {
        percent = rnd(4, 30)
        status.textContent = `Server says: lol no. Retrying (attempt ${requests})…`
      } else {
        status.textContent = `Verifying… ${percent}%`
      }
      bar.style.width = `${percent}%`
      setHeading(`Verification ${9 + Math.floor(requests / 12)} of ∞`)
    }, 220)

    const nests = window.setInterval(() => {
      depth += 1
      const box = document.createElement('div')
      box.className = 'api-nest'
      box.innerHTML = `<b>Captcha ${9 + depth} of ∞</b> — prove you're human to continue proving you're human`
      deepest.append(box)
      deepest = box
      tilt = Math.min(tilt + 0.5, 4)
      const root = nest.closest('.puzzle')
      if (root instanceof HTMLElement) {
        root.style.transform = `rotate(${(Math.random() * 2 - 1) * tilt}deg)`
      }
      if (depth === 6) setGlitch(true)
    }, 1600)

    return () => {
      window.clearInterval(feed)
      window.clearInterval(nests)
      const root = nest.closest('.puzzle')
      if (root instanceof HTMLElement) root.style.transform = ''
    }
  }, [])

  return (
    <Puzzle title={heading} prompt="Verifying…" className={glitch ? 'is-glitch' : undefined}>
      <div>
        <div className="api-term" ref={termRef} />
        <div className="api-bar">
          <i ref={barRef} />
        </div>
        <p className="hint" ref={statusRef}>
          Verifying…
        </p>
        <div ref={nestRef} />
      </div>
    </Puzzle>
  )
}
