export function rnd(min: number, max: number) {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

export function shuffle<T>(list: readonly T[]): T[] {
  const items = [...list]
  for (let i = items.length - 1; i > 0; i--) {
    const j = rnd(0, i)
    const current = items[i]
    items[i] = items[j] as T
    items[j] = current as T
  }
  return items
}
