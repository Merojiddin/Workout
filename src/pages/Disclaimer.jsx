import { Activity, HeartPulse, Stethoscope, Utensils } from 'lucide-react'
import { useT } from '../i18n'

/**
 * Step 20 - terms / disclaimer.
 *
 * Makes clear the app gives general fitness guidance, not medical advice.
 */
export function Disclaimer() {
  const t = useT()

  return (
    <section className="legal-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">{t('disclaimer.eyebrow')}</p>
          <h1>{t('disclaimer.title')}</h1>
          <p>{t('disclaimer.subtitle')}</p>
        </div>
      </header>

      <article className="dashboard-card legal-card">
        <h2>
          <Activity size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('disclaimer.notMedicalHeading')}
        </h2>
        <p>{t('disclaimer.notMedicalCopy')}</p>

        <h2>
          <HeartPulse size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('disclaimer.painHeading')}
        </h2>
        <p>{t('disclaimer.painCopy')}</p>

        <h2>
          <Stethoscope size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('disclaimer.professionalHeading')}
        </h2>
        <p>{t('disclaimer.professionalCopy')}</p>

        <h2>
          <Utensils size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('disclaimer.nutritionHeading')}
        </h2>
        <p>{t('disclaimer.nutritionCopy')}</p>
      </article>
    </section>
  )
}
