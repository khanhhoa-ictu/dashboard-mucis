const DEMO_SAMPLE_RATE = 11025
const DEMO_DURATION_SECONDS = 8

const frequencyPalette = [
  220,
  246.94,
  261.63,
  293.66,
  329.63,
  349.23,
  392,
  440,
  493.88,
  523.25,
]

const audioCache = new Map<string, string>()

function hashSeed(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

function createWaveDataUri(seed: string) {
  const sampleCount = DEMO_SAMPLE_RATE * DEMO_DURATION_SECONDS
  const dataSize = sampleCount * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  const seedHash = hashSeed(seed)
  const beatLength = DEMO_SAMPLE_RATE / 2

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, DEMO_SAMPLE_RATE, true)
  view.setUint32(28, DEMO_SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const time = sampleIndex / DEMO_SAMPLE_RATE
    const barIndex = Math.floor(sampleIndex / beatLength)
    const primary = frequencyPalette[(seedHash + barIndex) % frequencyPalette.length]
    const accent = frequencyPalette[(seedHash + barIndex + 3) % frequencyPalette.length]
    const envelopePosition = (sampleIndex % beatLength) / beatLength
    const envelope = envelopePosition < 0.08
      ? envelopePosition / 0.08
      : envelopePosition > 0.82
        ? (1 - envelopePosition) / 0.18
        : 1

    const mainVoice = Math.sin(2 * Math.PI * primary * time) * 0.55
    const softPad = Math.sin(2 * Math.PI * (primary / 2) * time) * 0.22
    const sparkle = Math.sin(2 * Math.PI * accent * time) * 0.18
    const pulse = Math.sin(2 * Math.PI * 3 * time) * 0.04

    const value = Math.max(-1, Math.min(1, (mainVoice + softPad + sparkle + pulse) * envelope))
    view.setInt16(44 + sampleIndex * 2, value * 32767, true)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return `data:audio/wav;base64,${btoa(binary)}`
}

export function getDemoAudioUrl(seed: string) {
  const normalizedSeed = seed.trim().toLowerCase()

  if (!audioCache.has(normalizedSeed)) {
    audioCache.set(normalizedSeed, createWaveDataUri(normalizedSeed))
  }

  return audioCache.get(normalizedSeed)!
}

