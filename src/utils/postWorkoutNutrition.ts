import { t } from '../i18n/t'
import type { WorkoutProgramCoaching } from '../types/workoutProgram'

/**
 * Read-only nutrition guidance shown after a workout and on the Nutrition
 * page. Nothing here is tracked or logged: it answers "what should I eat now"
 * and then gets out of the way.
 */

export interface SuggestedFood {
  name: string
  detail: string
}

export interface PostWorkoutMeal {
  /** Protein grams to aim for in the meal after training. */
  proteinGrams: number
  /** One-line description of the meal shape. */
  summary: string
  /** When to eat it. */
  timing: string
  foods: SuggestedFood[]
}

export interface DailyNutritionTarget {
  label: string
  value: string
  note: string
}

export interface NutritionGuidance {
  meal: PostWorkoutMeal
  daily: DailyNutritionTarget[]
  /** Foods worth keeping in the week, beyond the post-workout meal itself. */
  weeklyFoods: SuggestedFood[]
}

const PROTEIN_FALLBACK_MIN = 120
const PROTEIN_FALLBACK_MAX = 160

/**
 * Protein-forward options for the meal straight after training.
 *
 * Built on each call rather than held as a module constant: these are the
 * app's own advice, not user data, so they follow the chosen language, and a
 * constant would freeze whichever language happened to load the module first.
 */
const postWorkoutFoodKeys = [
  'chickenRice',
  'eggsToast',
  'yoghurt',
  'wheyShake',
  'fish',
  'cottageCheese',
] as const

/** Foods that matter across the week rather than at any one meal. */
const weeklySupportFoodKeys = [
  'oysters',
  'nutsOil',
  'darkChocolate',
  'greensBerries',
  'tropicalFruit',
] as const

function getPostWorkoutFoods(): SuggestedFood[] {
  return postWorkoutFoodKeys.map((key) => ({
    name: t(`food.${key}`),
    detail: t(`food.${key}Detail`),
  }))
}

function getWeeklySupportFoods(): SuggestedFood[] {
  return weeklySupportFoodKeys.map((key) => ({
    name: t(`food.${key}`),
    detail: t(`food.${key}Detail`),
  }))
}

/**
 * Builds the guidance from the active program's coaching block so a pasted
 * program with different protein numbers changes the advice automatically.
 */
export function getNutritionGuidance(
  coaching: WorkoutProgramCoaching | null | undefined,
): NutritionGuidance {
  const proteinMin = positiveNumber(coaching?.proteinMinGrams) ?? PROTEIN_FALLBACK_MIN
  const proteinMax = Math.max(
    proteinMin,
    positiveNumber(coaching?.proteinMaxGrams) ?? PROTEIN_FALLBACK_MAX,
  )
  const proteinDaily =
    positiveNumber(coaching?.proteinDefaultGrams) ??
    Math.round((proteinMin + proteinMax) / 2)

  // Roughly a quarter of the day's protein in the post-training meal, kept in
  // the 30-45 g band where a single meal is actually absorbed well.
  const mealProtein = clamp(Math.round(proteinDaily / 4 / 5) * 5, 30, 45)

  return {
    meal: {
      proteinGrams: mealProtein,
      summary: t('nutrition.meal.summary', { grams: mealProtein }),
      timing: t('nutrition.meal.timing'),
      foods: getPostWorkoutFoods(),
    },
    daily: [
      {
        label: t('nutrition.target.protein'),
        value: t('nutrition.target.proteinRange', {
          min: proteinMin,
          max: proteinMax,
        }),
        note: t('nutrition.target.proteinNote'),
      },
      {
        label: t('nutrition.target.water'),
        value: t('nutrition.target.waterValue'),
        note: t('nutrition.target.waterNote'),
      },
      // A pasted program may state its own creatine and sleep guidance; that
      // text belongs to the program and is shown as written.
      splitQuantity(
        t('nutrition.target.creatine'),
        coaching?.creatineDailyGrams ?? t('nutrition.target.creatineValue'),
        t('nutrition.target.creatineNote'),
      ),
      {
        label: t('nutrition.target.sleep'),
        value: coaching?.sleepHours ?? t('nutrition.target.sleepValue'),
        note: t('nutrition.target.sleepNote'),
      },
    ],
    weeklyFoods: getWeeklySupportFoods(),
  }
}

/**
 * Programs write coaching strings for prose ("3-5 g/day creatine monohydrate").
 * A stat tile only has room for the quantity, so the descriptive tail is moved
 * into the note underneath it.
 */
function splitQuantity(
  label: string,
  text: string,
  note: string,
): DailyNutritionTarget {
  const match = text
    .trim()
    .match(/^([\d.,]+\s*(?:-|–|to)?\s*[\d.,]*\s*(?:g|mg|grams?)\b\s*(?:\/\s*day|per day|daily)?)\s*(.*)$/i)
  if (!match) {
    return { label, value: text, note }
  }

  const tail = match[2].trim()
  return {
    label,
    value: match[1].replace(/\s+/g, ' ').trim(),
    note: tail ? `${capitalize(tail)}. ${note}` : note,
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
