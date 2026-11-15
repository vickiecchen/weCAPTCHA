import { useEffect, useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'

function drawCode(canvas: HTMLCanvasElement, code: string) {
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#8a8776'
  context.fillRect(0, 0, 340, 90)
  for (let i = 0; i < 500; i++) {
    context.fillStyle = `rgba(${rnd(0, 255)},${rnd(0, 255)},${rnd(0, 255)},.15)`
    context.fillRect(rnd(0, 340), rnd(0, 90), rnd(1, 6), rnd(1, 6))
  }
  context.font = 'italic bold 52px Georgia, serif'
  context.textBaseline = 'middle'
  ;[...code].forEach((character, index) => {
    context.save()
    context.translate(85 + index * 50, 45 + rnd(-6, 6))
    context.rotate((rnd(-18, 18) * Math.PI) / 180)
    context.fillStyle = '#1a1a1a'
    context.fillText(character, -14, 0)
    context.restore()
  })
  for (let i = 0; i < 3; i++) {
    context.strokeStyle = 'rgba(0,0,0,.35)'
    context.beginPath()
    context.moveTo(0, rnd(0, 90))
    context.bezierCurveTo(100, rnd(0, 90), 200, rnd(0, 90), 340, rnd(0, 90))
    context.stroke()
  }
}

function TypeTextRound({ onPass, onFail }: RoundApi) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [code] = useState(() => String(rnd(1000, 9999)))
  const [value, setValue] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCode(canvas, code)
    const focus = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(focus)
  }, [code])

  function submit() {
    if (value.trim() === code) onPass()
    else onFail()
  }

  return (
    <>
      <canvas ref={canvasRef} width={340} height={90} aria-label="Distorted verification text" />
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="Type the text"
        autoComplete="off"
        aria-label="Verification text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit()
        }}
      />
      <button type="button" className="puzzle-submit" onClick={submit}>
        Submit
      </button>
    </>
  )
}

export function TypeText(props: ChallengeProps) {
  return (
    <ChallengeRound title="Type the text you see" {...props}>
      {(api) => <TypeTextRound {...api} />}
    </ChallengeRound>
  )
}
