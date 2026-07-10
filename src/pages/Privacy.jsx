import { Cloud, Database, Download, Images, ShieldCheck } from 'lucide-react'

/**
 * Step 20 - privacy notice.
 *
 * Plain-language summary of where data lives. This is a personal fitness
 * tracker, not a data business: nothing is sold or shared.
 */
export function Privacy() {
  return (
    <section className="legal-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1>Privacy notice</h1>
          <p>Where your fitness data is stored and who can see it.</p>
        </div>
      </header>

      <article className="dashboard-card legal-card">
        <h2>
          <Database size={20} strokeWidth={2.4} aria-hidden="true" />
          Local storage by default
        </h2>
        <p>
          If cloud sync is not configured, everything you enter — workouts,
          body check-ins, nutrition logs, settings, and photos — is stored
          only in this browser&apos;s local storage on your device. Nothing
          leaves your device.
        </p>

        <h2>
          <Cloud size={20} strokeWidth={2.4} aria-hidden="true" />
          Cloud sync when you log in
        </h2>
        <p>
          If you create an account and log in, your data is also stored in a
          Supabase database tied to your account. Row Level Security ensures
          only your account can read or change your rows.
        </p>

        <h2>
          <Images size={20} strokeWidth={2.4} aria-hidden="true" />
          Progress photos
        </h2>
        <p>
          Progress photos may be uploaded to Supabase Storage when cloud sync
          is on. The photo bucket is private: photos are shown to you through
          short-lived signed links and are not publicly accessible.
        </p>

        <h2>
          <Download size={20} strokeWidth={2.4} aria-hidden="true" />
          Your data stays yours
        </h2>
        <p>
          You can export a full backup of your local data at any time
          (Settings → Backup), and you can delete all local data from this
          browser (Settings → Backup → Clear All Data). Exported files contain
          personal fitness data — keep them private.
        </p>

        <h2>
          <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
          No selling, no tracking
        </h2>
        <p>
          This is a personal fitness tracker. No data is sold, shared with
          advertisers, or used for anything other than showing you your own
          progress.
        </p>
      </article>
    </section>
  )
}
