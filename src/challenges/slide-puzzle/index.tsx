import { useEffect, useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { rnd } from '../random'
import type { ChallengeProps } from '../types'
import sceneUrl from './assets/scene.jpg'
import './styles.css'

const WIDTH = 316
const HEIGHT = 168
const PIECE = 40

function piecePath(x: number, y: number) {
  const path = new Path2D()
  path.rect(x, y, PIECE, PIECE)
  path.arc(x + PIECE / 2, y - 5, 7, 0, Math.PI * 2)
  return path
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement) {
  const scale = Math.max(WIDTH / image.naturalWidth, HEIGHT / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  context.drawImage(image, (WIDTH - width) / 2, (HEIGHT - height) / 2, width, height)
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
    let cancelled = false

    const paint = (scene: HTMLCanvasElement) => {
      if (cancelled) return
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
    }

    const ready = sceneRef.current
    if (ready) {
      paint(ready)
      return () => {
        cancelled = true
      }
    }

    const image = new Image()
    image.onload = () => {
      if (cancelled) return
      if (!sceneRef.current) {
        const scene = document.createElement('canvas')
        scene.width = WIDTH
        scene.height = HEIGHT
        const sceneContext = scene.getContext('2d')
        if (!sceneContext) return
        drawCover(sceneContext, image)
        sceneRef.current = scene
      }
      paint(sceneRef.current)
    }
    image.src = sceneUrl
    return () => {
      cancelled = true
    }
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
    <ChallengeRound prompt="Verification" title="Slide to complete the puzzle" {...props}>
      {(api) => <SlideRound {...api} />}
    </ChallengeRound>
  )
}
