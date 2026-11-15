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

type Item = { id: string; dog: boolean; emoji: string }

function makeItems(): Item[] {
  const dogs = Array.from({ length: 8 }, (_, index) => ({
    id: `chi${index + 1}`,
    dog: true,
    emoji: '🐶',
  }))
  const muffins = Array.from({ length: 8 }, (_, index) => ({
    id: `muffin${index + 1}`,
    dog: false,
    emoji: '🧁',
  }))
  return shuffle([...dogs, ...muffins])
}

function MuffinRound({ onPass, onFail }: RoundApi) {
  const [items] = useState(makeItems)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function verify() {
    const correct = items.every((item) => item.dog === selected.has(item.id))
    if (correct) onPass()
    else onFail()
  }

  return (
    <>
      <div className="grid muffin-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={selected.has(item.id) ? 'tile sel' : 'tile'}
            aria-pressed={selected.has(item.id)}
            onClick={() => toggle(item.id)}
          >
            <EmojiPhoto src={findAsset(photos, item.id)} emoji={item.emoji} />
          </button>
        ))}
      </div>
      <button type="button" className="puzzle-submit" onClick={verify}>
        Verify
      </button>
    </>
  )
}

export function MuffinChihuahua(props: ChallengeProps) {
  return (
    <ChallengeRound title="Select all chihuahuas" {...props}>
      {(api) => <MuffinRound {...api} />}
    </ChallengeRound>
  )
}
