/**
 * Reports which exercise-guide phrases still need a Vietnamese translation.
 *
 * The guide content in `src/data/exerciseLibrary.ts` stays English -- it is the
 * data layer that filters and program matching key off. `src/i18n/exercises/vi.ts`
 * is a display layer mapping the exact English phrase to its Vietnamese wording,
 * and anything absent from it falls back to the English. This script diffs the
 * two so the remaining work is always a known list rather than a guess.
 *
 *   node scripts/i18n-exercise-progress.mjs            # summary
 *   node scripts/i18n-exercise-progress.mjs --list     # every missing phrase
 *   node scripts/i18n-exercise-progress.mjs --list 40  # the next 40, most reused first
 *   node scripts/i18n-exercise-progress.mjs --json out.json
 */
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const flagValue = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { exerciseLibrary } = await server.ssrLoadModule(
    '/src/data/exerciseLibrary.ts',
  )
  const { exercisePhrasesVi } = await server.ssrLoadModule(
    '/src/i18n/exercises/vi.ts',
  )

  // How often each distinct phrase appears, so the highest-leverage strings
  // (the templated lines shared by every movement) can be done first.
  const counts = new Map()
  const bump = (phrase) => counts.set(phrase, (counts.get(phrase) ?? 0) + 1)

  for (const exercise of exerciseLibrary) {
    const name = exercise.name
    bump(name)

    const fields = [
      exercise.formCue,
      exercise.postureNotes,
      exercise.imageAlt,
      exercise.gifAlt,
      ...(exercise.instructions ?? []),
      ...(exercise.formTips ?? []),
      ...(exercise.commonMistakes ?? []),
      ...(exercise.progression ?? []),
      ...(exercise.regression ?? []),
    ].filter(Boolean)

    for (const field of fields) {
      if (field === name) continue
      // A line built from the movement's own name is stored once with a
      // {name} slot; see translateExerciseText.
      bump(field.includes(name) ? field.split(name).join('{name}') : field)
    }
  }

  const all = [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
  )
  const missing = all.filter(([phrase]) => exercisePhrasesVi[phrase] === undefined)
  const words = (list) =>
    list.reduce((total, [phrase]) => total + phrase.split(/\s+/).length, 0)

  const done = all.length - missing.length
  const occurrencesTotal = all.reduce((total, [, n]) => total + n, 0)
  const occurrencesDone = all
    .filter(([phrase]) => exercisePhrasesVi[phrase] !== undefined)
    .reduce((total, [, n]) => total + n, 0)

  console.log(`phrases translated : ${done}/${all.length}`)
  console.log(
    `on-screen coverage : ${occurrencesDone}/${occurrencesTotal} occurrences ` +
      `(${Math.round((occurrencesDone / occurrencesTotal) * 100)}%)`,
  )
  console.log(`remaining          : ${missing.length} phrases, ~${words(missing)} words`)

  // A key present in vi.ts that no longer exists in the library is dead weight
  // and usually means the English source was reworded.
  const known = new Set(all.map(([phrase]) => phrase))
  const orphans = Object.keys(exercisePhrasesVi).filter((key) => !known.has(key))
  if (orphans.length > 0) {
    console.log(`\norphaned keys (${orphans.length}) - no longer in the library:`)
    for (const key of orphans) console.log(`  ${JSON.stringify(key)}`)
  }

  const jsonPath = flagValue('--json')
  if (jsonPath) {
    writeFileSync(
      jsonPath,
      JSON.stringify(
        { missing: missing.map(([phrase, uses]) => ({ phrase, uses })), orphans },
        null,
        2,
      ),
    )
    console.log(`\nwrote ${jsonPath}`)
  }

  if (flag('--list')) {
    const limit = Number(flagValue('--list')) || missing.length
    console.log(`\nnext ${Math.min(limit, missing.length)} phrases (most reused first):`)
    for (const [phrase, uses] of missing.slice(0, limit)) {
      console.log(`  ${String(uses).padStart(3)}x  ${JSON.stringify(phrase)}`)
    }
  }

  process.exitCode = missing.length > 0 ? 1 : 0
} finally {
  await server.close()
}
