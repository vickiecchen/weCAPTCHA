import { useEffect, useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const WIDTH = 340
const HEIGHT = 180
const PIECE = 40

function piecePath(x: number, y: number) {
  const path = new Path2D()
  path.rect(x, y, PIECE, PIECE)
  path.arc(x + PIECE / 2, y - 5, 7, 0, Math.PI * 2)
  return path
}

function paintScene(context: CanvasRenderingContext2D) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#5fa8e6')
  sky.addColorStop(0.55, '#dcebf7')
  sky.addColorStop(0.56, '#2c3e50')
  sky.addColorStop(1, '#16212c')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = 'rgba(255,255,255,.92)'
  for (const [cx, cy] of [
    [40, 35],
    [150, 25],
    [250, 48],
  ] as const) {
    for (let i = 0; i < 4; i++) {
      context.beginPath()
      context.arc(cx + i * 14, cy + (i % 2) * 6, 16, 0, Math.PI * 2)
      context.fill()
    }
  }
  context.fillStyle = '#3a4a5a'
  context.beginPath()
  context.moveTo(WIDTH / 2 - 5, HEIGHT * 0.56)
  context.lineTo(WIDTH / 2 + 5, HEIGHT * 0.56)
  context.lineTo(WIDTH, HEIGHT)
  context.lineTo(0, HEIGHT)
  context.fill()
  context.strokeStyle = '#fff'
  context.lineWidth = 3
  context.setLineDash([14, 12])
  context.beginPath()
  context.moveTo(WIDTH / 2, HEIGHT * 0.56)
  context.lineTo(WIDTH / 2, HEIGHT)
  context.stroke()
  context.setLineDash([])
}

function positionOf(value: number) {
  return 8 + (value / 100) * (WIDTH - PIECE - 16)
}

function SlideRound({ onPass, onFail }: RoundApi) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)
  const sceneRef = useRef<HTMLCanvasElement | null>(null)
  const [{ holeX, holeY }] = useState(() => ({
    holeX: rnd(150, 270),
    holeY: rnd(50, 110),
  }))
  const [value, setValue] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    if (!sceneRef.current) {
      const scene = document.createElement('canvas')
      scene.width = WIDTH
      scene.height = HEIGHT
      const sceneContext = scene.getContext('2d')
      if (!sceneContext) return
      paintScene(sceneContext)
      sceneRef.current = scene
    }
    const scene = sceneRef.current
    const pieceX = positionOf(value)
    context.clearRect(0, 0, WIDTH, HEIGHT)
    context.drawImage(scene, 0, 0)
    context.fillStyle = 'rgba(0,0,0,.55)'
    context.fill(piecePath(holeX, holeY))
    context.save()
    context.clip(piecePath(pieceX, holeY))
    context.drawImage(scene, pieceX - holeX, 0)
    context.restore()
    context.strokeStyle = '#fff'
    context.lineWidth = 2
    context.stroke(piecePath(pieceX, holeY))
  }, [holeX, holeY, value])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    const check = () => {
      const pieceX = positionOf(Number(slider.value))
      if (Math.abs(pieceX - holeX) <= 4) onPass()
      else onFail()
    }
    slider.addEventListener('change', check)
    return () => slider.removeEventListener('change', check)
  }, [holeX, onFail, onPass])

  return (
    <div className="puzzle-slide">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Slide puzzle" />
      <input
        ref={sliderRef}
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={value}
        aria-label="Slide the puzzle piece"
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <p className="hint">Drag the slider to fit the puzzle piece</p>
    </div>
  )
}

export function SlidePuzzle(props: ChallengeProps) {
  return (
    <ChallengeRound title="Slide to complete the puzzle" {...props}>
      {(api) => <SlideRound {...api} />}
    </ChallengeRound>
  )
}
