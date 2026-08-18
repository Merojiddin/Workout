/**
 * Re-download the bundled exercise animations.
 *
 * WHERE THE GIFs COME FROM
 * ------------------------
 * Source project : ExerciseDB (open source)  https://oss.exercisedb.dev
 * Dataset        : https://github.com/bootstrapping-lab/exercisedb-api
 *                  -> src/data/exercises.json (1500 exercises)
 * Media CDN      : https://static.exercisedb.dev/media/<exerciseId>.gif
 *
 * Do NOT page the public API to rebuild this: oss.exercisedb.dev sits behind an
 * aggressive Cloudflare rate limit (error 1015 after a handful of requests) and
 * its cursor pagination repeats the first page forever, so you can only ever
 * retrieve 25 of the 1500 rows. The dataset JSON on GitHub is unthrottled.
 *
 * The library-id -> ExerciseDB-id pairing in src/data/exerciseGifs.ts was
 * curated by hand (fuzzy name matching, then a manual review pass), so this
 * script treats that file as the source of truth and only refreshes the media.
 *
 * Usage:
 *   node scripts/fetch-exercise-gifs.mjs           # download any missing GIFs
 *   node scripts/fetch-exercise-gifs.mjs --force   # re-download everything
 *
 * To ADD an exercise, look its movement up in the dataset, then add an entry to
 * src/data/exerciseGifs.ts with the ExerciseDB exerciseId and re-run this.
 * If the dataset has no faithful animation, leave it out - the app falls back to
 * the existing photo/placeholder, and a wrong demonstration is worse than none.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'exercise-gifs')
const MAP_FILE = join(ROOT, 'src', 'data', 'exerciseGifs.ts')
const MEDIA = 'https://static.exercisedb.dev/media'

const force = process.argv.includes('--force')

/** Pull the id pairs straight out of the generated map. */
async function readMap() {
  const src = await readFile(MAP_FILE, 'utf8')
  const entries = []
  const re = /'([^']+)':\s*\{[^}]*?exerciseId:\s*'([^']+)'/g
  let m
  while ((m = re.exec(src)) !== null) {
    entries.push({ libraryId: m[1], exerciseId: m[2] })
  }
  return entries
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  // Guard against an error page being written out as a .gif.
  if (buf.subarray(0, 3).toString('ascii') !== 'GIF') {
    throw new Error('response was not a GIF')
  }
  await writeFile(dest, buf)
  return buf.length
}

const entries = await readMap()
await mkdir(OUT_DIR, { recursive: true })

let downloaded = 0
let skipped = 0
const failures = []

for (const { libraryId, exerciseId } of entries) {
  const dest = join(OUT_DIR, `${libraryId}.gif`)
  if (!force && existsSync(dest)) {
    skipped += 1
    continue
  }
  try {
    const bytes = await download(`${MEDIA}/${exerciseId}.gif`, dest)
    downloaded += 1
    console.log(`  ${libraryId} <- ${exerciseId} (${(bytes / 1024).toFixed(0)}KB)`)
  } catch (error) {
    failures.push(`${libraryId} (${exerciseId}): ${error.message}`)
  }
}

console.log(
  `\n${entries.length} mapped - ${downloaded} downloaded, ${skipped} already present, ${failures.length} failed`,
)
if (failures.length > 0) {
  console.error('\nFailed:')
  for (const line of failures) {
    console.error(`  ${line}`)
  }
  process.exitCode = 1
}
