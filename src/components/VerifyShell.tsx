import { useEffect, useRef, useState } from 'react'
import { challenges } from '../challenges/registry'
import './debug.css'

const params = new URLSearchParams(window.location.search)

function clampLevel(i: number) {
  return Math.max(0, Math.min(challenges.length - 1, i))
}

function initialLevel() {
  const level = Number(params.get('level'))
  return Number.isFinite(level) && level > 0 ? clampLevel(level - 1) : 0
}

export function VerifyShell() {
  const [index, setIndex] = useState(initialLevel)
  // Bumping this remounts the current challenge (restart).
  const [run, setRun] = useState(0)
  const [debugOpen, setDebugOpen] = useState(() => params.has('debug'))

  const current = challenges[index]

  function load(i: number) {
    setIndex(clampLevel(i))
    setRun((n) => n + 1)
  }

  function handlePass() {
    if (index >= challenges.length - 1) {
      // Demo never finishes — team photo is an edit cut.
      load(0)
      return
    }
    load(index + 1)
  }

  function handleFail() {
    // Stay on the same challenge; puzzle handles its own retry UI.
  }

  function solve() {
    if (index < challenges.length - 1) load(index + 1)
  }

  function toggleFooter() {
    document.body.classList.toggle('nohud')
  }

  // Keep the latest handlers reachable from the one keydown listener.
  const actions = useRef({ load, solve, index })
  actions.current = { load, solve, index }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const { load, solve, index } = actions.current
      if (/^[1-9]$/.test(e.key)) load(Number(e.key) - 1)
      else if (e.key === 'n') load(index + 1)
      else if (e.key === 'p') load(index - 1)
      else if (e.key === 'r') load(index)
      else if (e.key === 's') solve()
      else if (e.key === 'h') toggleFooter()
      else if (e.key === 'd' || e.key === '`') setDebugOpen((open) => !open)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!current) return null

  return (
    <div className="stage">
      <current.Component key={`${index}-${run}`} onPass={handlePass} onFail={handleFail} />
      {debugOpen && (
        <div className="debug-menu">
          <b>DEBUG</b>{' '}
          <span>
            level {index + 1}/{challenges.length} · {current.id}
          </span>
          <div>
            {challenges.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i === index ? 'cur' : undefined}
                title={c.title}
                onClick={() => load(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div>
            <button type="button" onClick={() => load(index - 1)}>
              ◀ Prev
            </button>
            <button type="button" onClick={() => load(index + 1)}>
              Next ▶
            </button>
            <button type="button" onClick={() => load(index)}>
              ↻ Restart
            </button>
            <button type="button" onClick={solve}>
              ✓ Solve
            </button>
            <button type="button" onClick={toggleFooter}>
              Footer
            </button>
          </div>
          <small>d menu · r restart · s solve · n/p next/prev · h footer · 1-9 jump</small>
        </div>
      )}
    </div>
  )
}
