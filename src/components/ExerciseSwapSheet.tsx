import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { useT } from '../i18n'
import type { ActiveExerciseVariant } from '../utils/liveWorkoutUtils'

interface ExerciseSwapSheetProps {
  /** Movement currently in the slot, so it can be shown as the chosen one. */
  currentExerciseId: string
  /** What the slot trains, e.g. "Upper chest". Shown as the sheet's subtitle. */
  muscleGroup: string
  /** Sets already done on the current movement; drives the split warning. */
  doneSets: number
  variants: ActiveExerciseVariant[]
  onClose: () => void
  onSelect: (variantId: string) => void
}

/**
 * Swap the movement in one slot without leaving the workout.
 *
 * The bench is taken, the cable station has a queue, a shoulder is complaining
 * -- all of it happens mid-session, and the program already names the
 * alternatives it considers equivalent for the slot. This is that list.
 */
export function ExerciseSwapSheet({
  currentExerciseId,
  muscleGroup,
  doneSets,
  variants,
  onClose,
  onSelect,
}: ExerciseSwapSheetProps) {
  const t = useT()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="live-sheet">
      <button
        aria-label={t('swap.closeAria')}
        className="live-sheet__backdrop"
        onClick={onClose}
        type="button"
      />

      <section
        aria-label={t('swap.title')}
        className="live-sheet__panel"
        role="dialog"
        aria-modal="true"
      >
        <header className="live-sheet__head">
          <strong>{t('swap.title')}</strong>
          <button
            aria-label={t('swap.closeAria')}
            className="live-sheet__close"
            onClick={onClose}
            type="button"
          >
            <X size={17} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </header>

        <p className="swap-sheet__sub">
          {muscleGroup
            ? t('swap.sameSlotWithMuscle', { muscle: muscleGroup })
            : t('swap.sameSlot')}
        </p>

        {doneSets > 0 ? (
          <p className="swap-sheet__notice">
            {t('swap.loggedNotice', { count: doneSets })}
          </p>
        ) : null}

        <ul className="swap-sheet__list">
          {variants.map((variant) => {
            const selected = variant.id === currentExerciseId
            const target = variant.repRange || variant.duration

            return (
              <li key={variant.id}>
                <button
                  aria-current={selected ? 'true' : undefined}
                  className={`swap-sheet__item${
                    selected ? ' swap-sheet__item--selected' : ''
                  }`}
                  onClick={() => (selected ? onClose() : onSelect(variant.id))}
                  type="button"
                >
                  <span className="swap-sheet__copy">
                    <strong>{variant.name}</strong>
                    <small>
                      {[variant.equipment, target].filter(Boolean).join(' · ') ||
                        t('swap.sameTargetArea')}
                    </small>
                  </span>
                  <span className="swap-sheet__check" aria-hidden="true">
                    {selected ? <Check size={15} strokeWidth={3} /> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
