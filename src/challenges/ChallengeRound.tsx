import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import toolsUrl from './assets/puzzle-tools.png'
import type { ChallengeProps } from './types'
import './shared.css'

export type FooterAction = {
  label: string
  onClick: () => void
}

export type RoundApi = {
  onPass: () => void
  onFail: () => void
  setAction: (action: FooterAction | null) => void
}

export function Puzzle({
  title,
  prompt = 'Verification',
  hint,
  className,
  action,
  onRefresh,
  children,
}: {
  title: string
  prompt?: string
  hint?: string
  className?: string
  action?: FooterAction | null
  onRefresh?: () => void
  children: ReactNode
}) {
  return (
    <Card
      title={title}
      prompt={prompt}
      hint={hint}
      className={className}
      action={action}
      onRefresh={onRefresh}
    >
      {children}
    </Card>
  )
}

function Card({
  title,
  prompt = 'Verification',
  hint,
  message = '',
  className,
  action,
  onRefresh,
  children,
}: {
  title: string
  prompt?: string
  hint?: string
  message?: string
  className?: string
  action?: FooterAction | null
  onRefresh?: () => void
  children: ReactNode
}) {
  return (
    <div className={`puzzle${className ? ` ${className}` : ''}`}>
      <div className="puzzle-head">
        <small>{prompt}</small>
        <b>{title}</b>
        {hint ? <span className="puzzle-head-hint">{hint}</span> : null}
      </div>
      <div className="puzzle-body">{children}</div>
      <div className="puzzle-foot">
        <div className="puzzle-foot-left">
          {message ? (
            <p className="puzzle-error" role="alert">
              {message}
            </p>
          ) : null}
          <div
            className="puzzle-tools"
            role="group"
            aria-label="Challenge tools"
            style={{ backgroundImage: `url(${toolsUrl})` }}
          >
            <button type="button" className="puzzle-tool" aria-label="Get a new challenge" onClick={onRefresh} />
            <button type="button" className="puzzle-tool" aria-label="Audio challenge" />
            <button type="button" className="puzzle-tool" aria-label="Help" />
          </div>
        </div>
        {action ? (
          <button type="button" className="puzzle-submit" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Wrong answers show a footer error, then remount the round with a fresh puzzle. */
export function ChallengeRound({
  title,
  prompt = 'Verification',
  hint,
  className,
  onPass,
  onFail,
  children,
}: ChallengeProps & {
  title: string
  prompt?: string
  hint?: string
  className?: string
  children: (api: RoundApi) => ReactNode
}) {
  const [round, setRound] = useState(0)
  const [message, setMessage] = useState('')
  const [action, setActionState] = useState<FooterAction | null>(null)
  const locked = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    locked.current = false
  }, [round])

  const pass = useCallback(() => {
    if (locked.current) return
    locked.current = true
    setMessage('')
    onPass()
  }, [onPass])

  const fail = useCallback(() => {
    if (locked.current) return
    locked.current = true
    onFail()
    setMessage('weCAPTCHA failed. Please try again.')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setRound((n) => n + 1)
    }, 500)
  }, [onFail])

  const setAction = useCallback((next: FooterAction | null) => {
    setActionState(next)
  }, [])

  function refresh() {
    window.clearTimeout(timer.current)
    setMessage('')
    setRound((n) => n + 1)
  }

  return (
    <Card
      title={title}
      prompt={prompt}
      hint={hint}
      message={message}
      className={className}
      action={action}
      onRefresh={refresh}
    >
      <div key={round}>{children({ onPass: pass, onFail: fail, setAction })}</div>
    </Card>
  )
}
