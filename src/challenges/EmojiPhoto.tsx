import { useState } from 'react'

export function EmojiPhoto({ src, emoji }: { src?: string; emoji: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) return <span aria-hidden="true">{emoji}</span>
  return <img src={src} alt="" draggable={false} onError={() => setBroken(true)} />
}
