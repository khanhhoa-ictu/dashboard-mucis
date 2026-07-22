import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const illustrationsDir = path.join(root, 'src', 'assets', 'illustrations')

const presets = {
  'avatar-mia.png': { width: 512, height: 512, quality: 82 },
  'hero-activity.png': { width: 900, quality: 80 },
  'hero-activity-wide.png': { width: 1440, quality: 80 },
  'hero-dashboard.png': { width: 1440, quality: 80 },
  'hero-favorites.png': { width: 1440, quality: 80 },
  'hero-podcasts.png': { width: 1440, quality: 80 },
  'hero-settings.png': { width: 1440, quality: 80 },
}

const files = await fs.readdir(illustrationsDir)

for (const file of files) {
  if (!file.endsWith('.png')) continue

  const options = presets[file]
  if (!options) continue

  const inputPath = path.join(illustrationsDir, file)
  const outputPath = path.join(illustrationsDir, file.replace(/\.png$/i, '.webp'))

  const image = sharp(inputPath).resize({
    width: options.width,
    height: options.height,
    fit: 'inside',
    withoutEnlargement: true,
  })

  await image.webp({
    quality: options.quality,
    effort: 6,
  }).toFile(outputPath)
}

console.log('Illustrations optimized to WebP.')
