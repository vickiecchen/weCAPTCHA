let audio: AudioContext | null = null

export function beep(frequency: number, duration: number) {
  try {
    audio = audio ?? new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.frequency.value = frequency
    gain.gain.value = 0.05
    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
  } catch {
    // Autoplay can block audio until the next gesture.
  }
}
