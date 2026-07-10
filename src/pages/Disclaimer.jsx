import { Activity, HeartPulse, Stethoscope, Utensils } from 'lucide-react'

/**
 * Step 20 - terms / disclaimer.
 *
 * Makes clear the app gives general fitness guidance, not medical advice.
 */
export function Disclaimer() {
  return (
    <section className="legal-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Terms</p>
          <h1>Disclaimer</h1>
          <p>What this app is — and what it is not.</p>
        </div>
      </header>

      <article className="dashboard-card legal-card">
        <h2>
          <Activity size={20} strokeWidth={2.4} aria-hidden="true" />
          Fitness tracking, not medical advice
        </h2>
        <p>
          This app is for logging and reviewing your own training, body
          measurements, and nutrition. Nothing in it — including the Smart
          Coach suggestions — is medical advice, diagnosis, or treatment.
        </p>

        <h2>
          <HeartPulse size={20} strokeWidth={2.4} aria-hidden="true" />
          Pain and injury warnings are general guidance
        </h2>
        <p>
          Pain-level prompts and injury warnings are general safety reminders,
          not a professional assessment. They cannot detect or rule out an
          injury.
        </p>

        <h2>
          <Stethoscope size={20} strokeWidth={2.4} aria-hidden="true" />
          When to see a professional
        </h2>
        <p>
          If pain continues, gets worse, or limits normal movement, stop
          training the affected area and consult a qualified medical
          professional or physiotherapist before continuing.
        </p>

        <h2>
          <Utensils size={20} strokeWidth={2.4} aria-hidden="true" />
          Nutrition guidance is general
        </h2>
        <p>
          Protein, water, and calorie targets in this app are general fitness
          guidance, not a medical diet prescription. For medical conditions,
          allergies, or clinical weight management, consult a doctor or
          registered dietitian.
        </p>
      </article>
    </section>
  )
}
