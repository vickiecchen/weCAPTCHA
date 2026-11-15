import { useState } from 'react'
import { findAsset } from '../assets'
import { ChallengeRound, type RoundApi } from '../ChallengeRound'
import { EmojiPhoto } from '../EmojiPhoto'
import { shuffle } from '../random'
import type { ChallengeProps } from '../types'
import './styles.css'

const photos = import.meta.glob('./assets/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const PEOPLE = [
  { id: 1, name: 'Afaq', role: 'MathemaTech', emoji: '👩‍🦳', partner: false },
  { id: 2, name: 'Alice Huang', role: 'Spy', emoji: '🧑‍💻', partner: true },
  { id: 3, name: 'Ned Leeds', role: 'Competing CEO', emoji: '👩', partner: false },
  { id: 4, name: 'Unnamed', role: 'Mystery Employee', emoji: '❓', partner: true },
  { id: 5, name: 'Penn Badgley', role: 'Investor', emoji: '🦆', partner: false },
  { id: 6, name: 'Willem Dafoe', role: 'GOAT', emoji: '🧑‍🍳', partner: false },
  { id: 7, name: 'Lebron', role: 'Lebron', emoji: '👵', partner: false },
  { id: 8, name: 'Kimberly Powell', role: 'Vice President of Health Care', emoji: '👩‍💼', partner: true },
] as const

function CeoRound({ onPass, onFail }: RoundApi) {
  const [people] = useState(() => shuffle(PEOPLE))
  const [selected, setSelected] = useState<Set<number>>(() => new Set())

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function verify() {
    const correct = people.every((person) => person.partner === selected.has(person.id))
    if (correct) onPass()
    else onFail()
  }

  let placed = 0
  const cells = []
  for (let cell = 0; cell < 9; cell++) {
    if (cell === 4) {
      cells.push(
        <div key="ceo" className="tile ceo-center">
          <EmojiPhoto src={findAsset(photos, 'ceo')} emoji="🕴️" />
          <span className="cap">Jensen Huang · CEO</span>
        </div>,
      )
      continue
    }
    const person = people[placed]
    placed += 1
    if (!person) continue
    cells.push(
      <button
        key={person.id}
        type="button"
        className={selected.has(person.id) ? 'tile sel' : 'tile'}
        aria-pressed={selected.has(person.id)}
        onClick={() => toggle(person.id)}
      >
        {person.id === 4 ? (
          <span className="mystery-text">Unknown NVIDIA Employee</span>
        ) : (
          <EmojiPhoto src={findAsset(photos, `p${person.id}`)} emoji={person.emoji} />
        )}
      </button>,
    )
  }

  return (
    <>
      <p className="hint">Select every business partner of the CEO in the middle.</p>
      <div className="grid ceo-grid">{cells}</div>
      <button type="button" className="puzzle-submit" onClick={verify}>
        Verify
      </button>
    </>
  )
}

export function CeoPartners(props: ChallengeProps) {
  return (
    <ChallengeRound title="Select all of the CEO's business partners" {...props}>
      {(api) => <CeoRound {...api} />}
    </ChallengeRound>
  )
}
