import { useMemo } from 'react'
import { PostWorkoutNutritionCard } from '../components/PostWorkoutNutritionCard'
import { useLanguage } from '../i18n'
import { getActiveWorkoutProgram } from '../utils/activeWorkoutProgram'
import { getNutritionGuidance } from '../utils/postWorkoutNutrition'

/**
 * Read-only nutrition guidance. There used to be a checklist, a log form, a
 * history table and five charts here; none of it is needed to answer "what
 * should I eat", and tracking meals was explicitly not wanted.
 */
export function Nutrition() {
  const { language, t } = useLanguage()
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  // The guidance text is built in the active language, so the memo has to be
  // keyed on it as well as on the program.
  const guidance = useMemo(
    () => getNutritionGuidance(activeProgram.coaching),
    [activeProgram, language],
  )

  return (
    <section className="nutrition-page">
      <header className="nutrition-page__head">
        <h1>{t('nutrition.title')}</h1>
        <p>{t('nutrition.subtitle')}</p>
      </header>

      <PostWorkoutNutritionCard guidance={guidance} variant="page" />

      <section className="nutrition-targets" aria-label={t('nutrition.dailyAria')}>
        <h2>{t('nutrition.dailyHeading')}</h2>
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

      <section className="nutrition-weekly" aria-label={t('nutrition.weeklyAria')}>
        <h2>{t('nutrition.weeklyHeading')}</h2>
        <ul>
          {guidance.weeklyFoods.map((food) => (
            <li key={food.name}>
              <strong>{food.name}</strong>
              <span>{food.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="nutrition-page__note">{t('nutrition.disclaimer')}</p>
    </section>
  )
}
