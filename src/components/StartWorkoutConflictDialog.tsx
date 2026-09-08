import { AlertTriangle, Play, Save, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useT } from '../i18n'
import {
  getDoneSetsCount,
  getTotalPlannedSets,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'

interface StartWorkoutConflictDialogProps {
  /** The workout already underway. */
  current: ActiveWorkoutSession
  /** The name of the workout being started instead. */
  nextName: string
  /** Shown when saving the current workout to history failed. */
  error?: string | null
  onCancel: () => void
  onDiscardAndStart: () => void
  onSaveAndStart: () => void
}

/**
 * Asked before one workout replaces another.
 *
 * Only one workout can be in progress at a time, so starting a second one
 * ends the first. That used to happen without asking - the app quietly
 * bounced back to the unfinished-workout screen - which is the same silence
 * whether the session being displaced is untouched or half logged.
 *
 * Where sets have already been done, throwing them away is not the only
 * sensible answer, so both are offered: the workout can go to history exactly
 * as ending it early does, or be discarded. With nothing logged there is
 * nothing to save and the question is just a confirmation.
 */
export function StartWorkoutConflictDialog({
  current,
  nextName,
  error,
  onCancel,
  onDiscardAndStart,
  onSaveAndStart,
}: StartWorkoutConflictDialogProps) {
  const t = useT()
  const doneSets = getDoneSetsCount(current)
  const currentName = current?.workoutName ?? t('unfinished.workoutFallback')
  // Starting today's workout over is the same conflict, but naming the same
  // workout on both sides of the sentence reads like a bug. Say "again".
  const isRestart = nextName === currentName

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="confirm-dialog">
      <button
        aria-label={t('action.cancel')}
        className="confirm-dialog__backdrop"
        onClick={onCancel}
        type="button"
      />
      <section
        aria-labelledby="start-conflict-title"
        aria-modal="true"
        className="confirm-dialog__panel"
        role="dialog"
      >
        <span className="confirm-dialog__icon" aria-hidden="true">
          <AlertTriangle size={22} strokeWidth={2.4} />
        </span>
        <h2 id="start-conflict-title">{t('startConflict.title')}</h2>
        <p className="confirm-dialog__body">
          {doneSets > 0
            ? t(isRestart ? 'startConflict.bodyRestart' : 'startConflict.body', {
                name: currentName,
                done: doneSets,
                total: getTotalPlannedSets(current),
                next: nextName,
              })
            : t(
                isRestart
                  ? 'startConflict.bodyEmptyRestart'
                  : 'startConflict.bodyEmpty',
                { name: currentName, next: nextName },
              )}
        </p>

        {error ? (
          <p className="confirm-dialog__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="confirm-dialog__actions">
          {doneSets > 0 ? (
            <>
              <button
                className="workout-primary-button"
                onClick={onSaveAndStart}
                type="button"
              >
                <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                {t(
                  isRestart
                    ? 'startConflict.saveAndRestart'
                    : 'startConflict.saveAndStart',
                )}
              </button>
              <button
                className="workout-secondary-button workout-secondary-button--danger"
                onClick={onDiscardAndStart}
                type="button"
              >
                <Trash2 size={18} strokeWidth={2.4} aria-hidden="true" />
                {t(
                  isRestart
                    ? 'startConflict.discardAndRestart'
                    : 'startConflict.discardAndStart',
                )}
              </button>
            </>
          ) : (
            <button
              className="workout-primary-button"
              onClick={onDiscardAndStart}
              type="button"
            >
              <Play size={18} strokeWidth={2.4} aria-hidden="true" />
              {t(isRestart ? 'startConflict.startAgain' : 'startConflict.startAnyway')}
            </button>
          )}
          <button
            className="confirm-dialog__cancel"
            onClick={onCancel}
            type="button"
          >
            {t('action.cancel')}
          </button>
        </div>
      </section>
    </div>
  )
}
