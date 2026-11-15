import { useEffect, useRef, useState, type ReactNode } from 'react'
import { beep } from './beep'
import type { ChallengeProps } from './types'
import './shared.css'

export type RoundApi = {
  onPass: () => void
  onFail: () => void
}

export function Puzzle({
  title,
  sub = 'Verification',
  className,
  children,
}: {
  title: string
  sub?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Card title={title} sub={sub} className={className}>
      {children}
    </Card>
  )
}

function Card({
  title,
  sub = 'Verification',
  message = '',
  className,
  children,
}: {
  title: string
  sub?: string
  message?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`puzzle${message ? ' is-shake' : ''}${className ? ` ${className}` : ''}`}>
      <div className="puzzle-head">
        <small>{sub}</small>
        <b>{title}</b>
      </div>
      <div className={message ? 'puzzle-msg on' : 'puzzle-msg'} role={message ? 'alert' : undefined}>
        {message}
      </div>
      <div className="puzzle-body">{children}</div>
      <div className="puzzle-foot">
        <span />
        <span>Privacy · Terms</span>
      </div>
    </div>
  )
}

/** Wrong answers shake, show a retry line, then remount the round with a fresh puzzle. */
export function ChallengeRound({
  title,
  onPass,
  onFail,
  children,
}: ChallengeProps & {
  title: string
  children: (api: RoundApi) => ReactNode
}) {
  const [round, setRound] = useState(0)
  const [message, setMessage] = useState('')
  const locked = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    locked.current = false
  }, [round])

  function pass() {
    if (locked.current) return
    locked.current = true
    beep(880, 0.12)
    onPass()
  }

  function fail() {
    if (locked.current) return
    locked.current = true
    beep(160, 0.25)
    onFail()
    setMessage('Incorrect. Try again.')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setMessage('')
      setRound((n) => n + 1)
    }, 700)
  }

  return (
    <Card title={title} message={message}>
      <div key={round} className={message ? 'is-locked' : undefined}>
        {children({ onPass: pass, onFail: fail })}
      </div>
    </Card>
  )
}
