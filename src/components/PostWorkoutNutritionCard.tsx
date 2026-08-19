import { Utensils } from 'lucide-react'
import { useT } from '../i18n'
import type { NutritionGuidance } from '../utils/postWorkoutNutrition'

interface PostWorkoutNutritionCardProps {
  guidance: NutritionGuidance
  /** Tighter heading wording for the post-workout screen. */
  variant?: 'after-workout' | 'page'
}

/**
 * Read-only eating advice. There is deliberately nothing to tick off, submit
 * or save here — it is a recommendation, not a tracker.
 */
export function PostWorkoutNutritionCard({
  guidance,
  variant = 'after-workout',
}: PostWorkoutNutritionCardProps) {
  const t = useT()
  const { meal } = guidance

  return (
    <section className="nutrition-advice" aria-labelledby="nutrition-advice-title">
      <header className="nutrition-advice__head">
        <span className="nutrition-advice__icon" aria-hidden="true">
          <Utensils size={19} strokeWidth={2.4} />
        </span>
        <div>
          <h2 id="nutrition-advice-title">
            {variant === 'after-workout'
              ? t('nutrition.card.afterWorkout')
              : t('nutrition.card.page')}
          </h2>
          <p>{meal.summary}</p>
          <p className="nutrition-advice__timing">{meal.timing}</p>
        </div>
      </header>

      <ul className="nutrition-advice__foods">
        {meal.foods.map((food) => (
          <li key={food.name}>
            <strong>{food.name}</strong>
            <span>{food.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
