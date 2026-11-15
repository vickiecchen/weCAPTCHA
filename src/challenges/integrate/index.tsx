import { useEffect, useRef, useState } from 'react'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import type { ChallengeProps } from '../types'
import integralUrl from './assets/integral.png'
import './styles.css'

const FIRST_DIGITS = '177245'

function isFirstDigits(raw: string) {
  const text = raw.trim().replace(/\s+/g, '')
  if (!/^\d*\.?\d+$/.test(text)) return false
  if (!text.includes('.')) return text === FIRST_DIGITS
  const value = Number(text)
  return value >= 1.77245 && value < 1.77246
}

function IntegrateRound({ onPass, onFail, setAction }: RoundApi) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  function submit() {
    if (isFirstDigits(value)) onPass()
    else onFail()
  }

  useEffect(() => {
    const focus = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(focus)
  }, [])

  useEffect(() => {
    setAction({
      label: 'VERIFY',
      onClick: () => {
        if (isFirstDigits(value)) onPass()
        else onFail()
      },
    })
  }, [onFail, onPass, setAction, value])

  return (
    <>
      <img
        className="integral"
        src={integralUrl}
        alt="Integral from negative infinity to infinity of e to the minus x squared plus eight other terms, dx"
      />
      <input
        ref={inputRef}
        className="integrate-input"
        type="text"
        inputMode="decimal"
        placeholder="Answer"
        autoComplete="off"
        aria-label="First 6 digits"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit()
        }}
      />
    </>
  )
}

export function Integrate(props: ChallengeProps) {
  return (
    <ChallengeRound title="Integrate (first 6 digits)" prompt="" {...props}>
      {(api) => <IntegrateRound {...api} />}
    </ChallengeRound>
  )
}
