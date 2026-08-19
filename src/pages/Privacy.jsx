import { Cloud, Database, Download, Images, ShieldCheck } from 'lucide-react'
import { useT } from '../i18n'

/**
 * Step 20 - privacy notice.
 *
 * Plain-language summary of where data lives. This is a personal fitness
 * tracker, not a data business: nothing is sold or shared.
 */
export function Privacy() {
  const t = useT()

  return (
    <section className="legal-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">{t('privacy.eyebrow')}</p>
          <h1>{t('privacy.title')}</h1>
          <p>{t('privacy.subtitle')}</p>
        </div>
      </header>

      <article className="dashboard-card legal-card">
        <h2>
          <Database size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('privacy.localHeading')}
        </h2>
        <p>{t('privacy.localCopy')}</p>

        <h2>
          <Cloud size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('privacy.cloudHeading')}
        </h2>
        <p>{t('privacy.cloudCopy')}</p>

        <h2>
          <Images size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('privacy.photosHeading')}
        </h2>
        <p>{t('privacy.photosCopy')}</p>

        <h2>
          <Download size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('privacy.exportHeading')}
        </h2>
        <p>{t('privacy.exportCopy')}</p>

        <h2>
          <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
          {t('privacy.noSellingHeading')}
        </h2>
        <p>{t('privacy.noSellingCopy')}</p>
      </article>
    </section>
  )
}
