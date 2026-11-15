import { useState } from 'react'
import { challenges } from '../challenges/registry'

export function VerifyShell() {
  const [index, setIndex] = useState(0)

  const current = challenges[index]
  if (!current) return null

  function handlePass() {
    if (index >= challenges.length - 1) {
      // Demo never finishes — team photo is an edit cut.
      setIndex(0)
      return
    }
    setIndex((i) => i + 1)
  }

  function handleFail() {
    // Stay on the same challenge; puzzle handles its own retry UI.
  }

  return (
    <div className="stage">
      <current.Component onPass={handlePass} onFail={handleFail} />
    </div>
  )
}
