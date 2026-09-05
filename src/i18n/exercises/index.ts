import type { LibraryExercise } from '../../data/exerciseLibrary'
import { getLanguage } from '../store'
import type { LanguageCode } from '../languages'
import { guidedPhrasesVi } from './guidedVi'
import { exercisePhrasesVi } from './vi'
import { translateMuscles } from './terms'

/**
 * Translation of the exercise guide content.
 *
 * The library itself stays in English. It is the data layer -- filters compare
 * against its category and equipment values, workout programs match against
 * its ids and names, and a user's own custom exercises live in the same array
 * -- so translating it in place would break matching and would have nothing to
 * say about an exercise the user added themselves.
 *
 * Instead this is a display layer keyed on the English text. Every phrase that
 * has a translation is swapped; anything unrecognised is passed through as
 * written, which is exactly the right behaviour for custom entries.
 */
type PhraseMap = Record<string, string>

const phrases: Partial<Record<LanguageCode, PhraseMap>> = {
  // The guided workouts keep their copy in a file of their own: the strength
  // library's map is already 2,000 entries, and the two are edited by
  // different work.
  vi: { ...exercisePhrasesVi, ...guidedPhrasesVi },
}

/**
 * A handful of guide lines are generated from the exercise's own name
 * ("Use a lighter Goblet Squat variation"). Rather than storing 156 near
 * identical translations, those are held once with a {name} slot and matched
 * by substituting the name back out.
 */
const NAME_SLOT = '{name}'

export function translateExerciseText(
  text: string,
  exerciseName: string,
  language: LanguageCode = getLanguage(),
): string {
  const map = phrases[language]
  if (!map || !text) {
    return text
  }

  const direct = map[text]
  if (direct !== undefined) {
    return direct
  }

  if (exerciseName && text.includes(exerciseName)) {
    const template = map[text.split(exerciseName).join(NAME_SLOT)]
    if (template !== undefined) {
      const translatedName = map[exerciseName] ?? exerciseName
      return template.split(NAME_SLOT).join(translatedName)
    }
  }

  return text
}

function translateList(
  values: readonly string[] | undefined,
  exerciseName: string,
  language: LanguageCode,
): string[] {
  return (values ?? []).map((value) =>
    translateExerciseText(value, exerciseName, language),
  )
}

/**
 * The exercise as it should be read, with every guide field in the active
 * language. The id, media and workout-day links are untouched: they are data,
 * not copy.
 */
export function getExerciseCopy(
  exercise: LibraryExercise,
  language: LanguageCode = getLanguage(),
): LibraryExercise {
  if (language === 'en') {
    return exercise
  }

  const name = exercise.name
  const text = (value: string) => translateExerciseText(value, name, language)

  return {
    ...exercise,
    name: text(name),
    // Kept as the English value so filters and category lookups still match;
    // `categoryLabel` below is what a screen should print.
    primaryMuscles: translateMuscles(exercise.primaryMuscles, language),
    secondaryMuscles: translateMuscles(exercise.secondaryMuscles, language),
    formCue: text(exercise.formCue),
    instructions: translateList(exercise.instructions, name, language),
    formTips: translateList(exercise.formTips, name, language),
    commonMistakes: translateList(exercise.commonMistakes, name, language),
    progression: translateList(exercise.progression, name, language),
    regression: translateList(exercise.regression, name, language),
    postureNotes: text(exercise.postureNotes),
    imageAlt: exercise.imageAlt ? text(exercise.imageAlt) : exercise.imageAlt,
    gifAlt: exercise.gifAlt ? text(exercise.gifAlt) : exercise.gifAlt,
  }
}

/** Just the name, for lists and headings that do not need the whole guide. */
export function getExerciseName(
  exercise: Pick<LibraryExercise, 'name'>,
  language: LanguageCode = getLanguage(),
): string {
  return translateExerciseText(exercise.name, exercise.name, language)
}

export {
  translateCategory,
  translateDifficulty,
  translateEquipment,
  translateMuscle,
  translateMuscles,
} from './terms'
