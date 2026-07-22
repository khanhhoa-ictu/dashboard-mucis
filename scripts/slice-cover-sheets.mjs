import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const generatedDir = 'C:/Users/Admin/.codex/generated_images/019f7a28-88fb-7752-bfc4-6a6698d78e1e'
const outputDir = path.join(root, 'src', 'assets', 'covers')

await fs.mkdir(outputDir, { recursive: true })

async function sliceGrid(inputPath, columns, rows, names, padding = 6) {
  const image = sharp(inputPath)
  const meta = await image.metadata()
  const cellSize = Math.floor(Math.min(meta.width / columns, meta.height / rows))

  for (let index = 0; index < names.length; index += 1) {
    const col = index % columns
    const row = Math.floor(index / columns)
    const left = Math.round(col * cellSize + padding)
    const top = Math.round(row * cellSize + padding)
    const size = Math.round(cellSize - padding * 2)
    const output = path.join(outputDir, `${names[index]}.webp`)

    await image
      .clone()
      .extract({ left, top, width: size, height: size })
      .resize(512, 512)
      .webp({ quality: 84, effort: 6 })
      .toFile(output)
  }
}

await sliceGrid(
  path.join(generatedDir, 'call_wFV1jtcDaJK7vF4fAmDhvdHo.png'),
  4,
  2,
  ['sunset', 'amber', 'latte', 'dream', 'night', 'room', 'fireplace', 'heart'],
)

await sliceGrid(
  path.join(generatedDir, 'call_eYTZGt0hS3iHFBu5rym7Rt6P.png'),
  4,
  2,
  ['space', 'travel', 'mic', 'board', 'history', 'brain', 'rocket', 'summer'],
)

await sliceGrid(
  path.join(generatedDir, 'call_Rx4k5siovD0czUc6yZ6pGLkC.png'),
  2,
  2,
  ['artist-a', 'artist-b', 'artist-c', 'artist-d'],
  8,
)

await sliceGrid(
  path.join(generatedDir, 'call_fE34FaUk3ovIWFmhJwGso578.png'),
  4,
  3,
  [
    'weekend-van',
    'coffee-latte',
    'dream-clouds',
    'moon-river',
    'cozy-room',
    'road-trip',
    'summer-pool',
    'heart-balloon',
    'study-desk',
    'fireplace-night',
    'mic-stage',
    'rhythm-waves',
  ],
)

console.log('Cover sheets sliced into individual assets.')
