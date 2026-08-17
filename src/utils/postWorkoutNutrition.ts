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

/** Protein-forward options for the meal straight after training. */
const postWorkoutFoods: SuggestedFood[] = [
  { name: 'Chicken or beef with rice', detail: 'Around 35-40 g protein plus the carbs to refill training energy' },
  { name: 'Eggs on toast (3-4 eggs)', detail: 'Around 20-25 g protein, quick to make, adds vitamin D' },
  { name: 'Greek yoghurt with fruit and honey', detail: 'Around 20 g protein, easy when you are not hungry yet' },
  { name: 'Whey shake with milk and a banana', detail: 'Around 30 g protein when a real meal is more than an hour away' },
  { name: 'Salmon or white fish with potatoes', detail: 'Around 35 g protein plus omega-3' },
  { name: 'Cottage cheese with nuts', detail: 'Around 25 g protein, good as a late-evening version' },
]

/** Foods that matter across the week rather than at any one meal. */
const weeklySupportFoods: SuggestedFood[] = [
  { name: 'Oysters or shellfish', detail: 'Zinc, once or twice a week' },
  { name: 'Nuts and olive oil', detail: 'Healthy fats and magnesium' },
  { name: 'Dark chocolate (70%+)', detail: 'Magnesium, a square or two' },
  { name: 'Leafy greens and berries', detail: 'Micronutrients and fibre' },
  { name: 'Dragon fruit or mangosteen', detail: 'Antioxidants and fibre' },
]

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
      summary: `Aim for about ${mealProtein} g protein with a carb source. No need to weigh anything.`,
      timing: 'Within about two hours of finishing. Sooner if you trained fasted.',
      foods: postWorkoutFoods,
    },
    daily: [
      {
        label: 'Protein today',
        value: `${proteinMin}-${proteinMax} g`,
        note: 'The one number that matters most for building muscle.',
      },
      {
        label: 'Water',
        value: '2-3 L',
        note: 'Add a glass or two on training days.',
      },
      splitQuantity(
        'Creatine',
        coaching?.creatineDailyGrams ?? '3-5 g/day',
        'Any time of day. Consistency beats timing.',
      ),
      {
        label: 'Sleep',
        value: coaching?.sleepHours ?? '7-8+ hours',
        note: 'Outranks every food choice on this page.',
      },
    ],
    weeklyFoods: weeklySupportFoods,
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
