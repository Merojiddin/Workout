import { useMemo } from 'react'
import { PostWorkoutNutritionCard } from '../components/PostWorkoutNutritionCard'
import { getActiveWorkoutProgram } from '../utils/activeWorkoutProgram'
import { getNutritionGuidance } from '../utils/postWorkoutNutrition'

/**
 * Read-only nutrition guidance. There used to be a checklist, a log form, a
 * history table and five charts here; none of it is needed to answer "what
 * should I eat", and tracking meals was explicitly not wanted.
 */
export function Nutrition() {
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const guidance = useMemo(
    () => getNutritionGuidance(activeProgram.coaching),
    [activeProgram],
  )

  return (
    <section className="nutrition-page">
      <header className="nutrition-page__head">
        <h1>Nutrition</h1>
        <p>What to eat after training, and the few daily numbers that matter.</p>
      </header>

      <PostWorkoutNutritionCard guidance={guidance} variant="page" />

      <section className="nutrition-targets" aria-label="Daily targets">
        <h2>Every day</h2>
        <div className="nutrition-targets__grid">
          {guidance.daily.map((target) => (
            <article key={target.label}>
              <span>{target.label}</span>
              <strong>{target.value}</strong>
              <small>{target.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="nutrition-weekly" aria-label="Foods worth keeping in the week">
        <h2>Worth eating this week</h2>
        <ul>
          {guidance.weeklyFoods.map((food) => (
            <li key={food.name}>
              <strong>{food.name}</strong>
              <span>{food.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="nutrition-page__note">
        General guidance for training support, not medical or dietary advice.
        Sleep and consistent protein matter more than any single food here.
      </p>
    </section>
  )
}
