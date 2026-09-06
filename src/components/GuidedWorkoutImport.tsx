import { AlertTriangle, Check, CheckCircle2, Copy, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useT } from '../i18n'
import type { CustomGuidedWorkout } from '../utils/customGuidedWorkouts'
import {
  buildGuidedWorkoutPrompt,
  parseGuidedWorkoutInput,
  type ParsedGuidedWorkoutsResult,
} from '../utils/guidedWorkoutImport'
import {
  getGuidedWorkoutMinutes,
  getGuidedWorkoutSummary,
  translateGuidedText,
} from '../utils/guidedWorkoutUtils'

interface GuidedWorkoutImportProps {
  onCancel: () => void
  /** How many were actually saved. Below the parsed count means a write failed. */
  onImport: (workouts: CustomGuidedWorkout[]) => number
}

const placeholder = `[
  {
    "name": "Friday Conditioning",
    "categoryId": "cardio",
    "steps": [ ... ]
  }
]`

/**
 * Bringing in workouts written somewhere else.
 *
 * Two ways in, and they meet at the same parser: a `.json` file, or text
 * pasted straight out of a chat. The Copy prompt button hands that chat the
 * schema and every movement id the catalog has, which is what makes the reply
 * paste back in cleanly instead of naming movements this app has never heard
 * of.
 */
export function GuidedWorkoutImport({ onCancel, onImport }: GuidedWorkoutImportProps) {
  const t = useT()
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ParsedGuidedWorkoutsResult | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'manual'>('idle')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  // What each parsed workout will actually run as, so the length shown is the
  // real timeline rather than a guess made before it is saved.
  const previews = useMemo(
    () =>
      (result?.workouts ?? []).map((workout) => {
        const summary = getGuidedWorkoutSummary(workout)
        return {
          id: workout.id,
          minutes: t('guided.minutes', {
            count: getGuidedWorkoutMinutes(summary.totalSeconds),
          }),
          moves: t('guided.moveCount', { count: summary.exerciseCount }),
          name: translateGuidedText(workout.name),
        }
      }),
    [result, t],
  )

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Cleared straight away so re-picking the same file after a fix re-fires.
    event.target.value = ''
    if (!file) {
      return
    }

    setSaveFailed(false)
    setFileName(file.name)
    try {
      const contents = await file.text()
      setText(contents)
      setResult(parseGuidedWorkoutInput(contents))
    } catch {
      setText('')
      setResult({
        success: false,
        workouts: [],
        errors: [t('guided.importReadFailed', { name: file.name })],
        warnings: [],
      })
    }
  }

  async function handleCopyPrompt() {
    const prompt = buildGuidedWorkoutPrompt()
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyLabel('copied')
    } catch {
      // No clipboard permission: put it in the box instead, where it can be
      // selected by hand rather than lost.
      setCopyLabel('manual')
      setText(prompt)
      setResult(null)
    }
    window.setTimeout(() => setCopyLabel('idle'), 2500)
  }

  function handleCheck() {
    setSaveFailed(false)
    setResult(parseGuidedWorkoutInput(text))
  }

  function handleImport() {
    const parsed = result ?? parseGuidedWorkoutInput(text)
    setResult(parsed)
    if (!parsed.success) {
      return
    }
    setSaveFailed(onImport(parsed.workouts) === 0)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-label={t('guided.importTitle')}
        aria-modal="true"
        className="workout-detail-modal guided-import"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('guided.importEyebrow')}</p>
            <h2>{t('guided.importTitle')}</h2>
          </div>
          <button
            aria-label={t('guided.builderCancel')}
            className="modal-close-button"
            onClick={onCancel}
            type="button"
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <p className="paste-program__hint">{t('guided.importHint')}</p>

        <button
          className="workout-secondary-button"
          onClick={handleCopyPrompt}
          type="button"
        >
          <Copy size={17} strokeWidth={2.4} aria-hidden="true" />
          {copyLabel === 'copied'
            ? t('action.copied')
            : copyLabel === 'manual'
              ? t('guided.importCopyManual')
              : t('guided.importCopyPrompt')}
        </button>

        <input
          accept="application/json,.json"
          className="paste-program__file-input"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="workout-secondary-button"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload size={17} strokeWidth={2.4} aria-hidden="true" />
          {t('guided.importChooseFile')}
        </button>
        {fileName ? (
          <p className="paste-program__file-name">
            {t('guided.importLoaded', { name: fileName })}
          </p>
        ) : null}

        <label className="paste-program__label" htmlFor="guided-import-input">
          {t('guided.importJsonLabel')}{' '}
          <span className="paste-program__label-note">
            {t('guided.importJsonLabelNote')}
          </span>
        </label>
        <textarea
          className="paste-program__textarea"
          id="guided-import-input"
          onChange={(event) => {
            setText(event.target.value)
            setResult(null)
            setFileName(null)
            setSaveFailed(false)
          }}
          placeholder={placeholder}
          rows={9}
          spellCheck={false}
          value={text}
        />

        {result ? (
          <div
            className={`paste-program__result paste-program__result--${
              result.success ? 'ok' : 'error'
            }`}
            role={result.success ? 'status' : 'alert'}
          >
            {result.success ? (
              <>
                <p className="paste-program__result-title">
                  <CheckCircle2 size={17} strokeWidth={2.4} aria-hidden="true" />
                  {t('guided.importReady', { count: result.workouts.length })}
                </p>
                <ul className="paste-program__issues paste-program__issues--muted">
                  {previews.map((preview) => (
                    <li key={preview.id}>
                      {t('guided.importPreview', {
                        minutes: preview.minutes,
                        moves: preview.moves,
                        name: preview.name,
                      })}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="paste-program__result-title">
                <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
                {t('guided.importUnusable')}
              </p>
            )}

            {result.errors.length > 0 ? (
              <ul className="paste-program__issues">
                {result.errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}

            {result.warnings.length > 0 ? (
              <details className="paste-program__warnings">
                <summary>
                  {t('guided.importWarnings', { count: result.warnings.length })}
                </summary>
                <ul className="paste-program__issues paste-program__issues--muted">
                  {result.warnings.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {saveFailed ? (
          <p className="guided-finish__saved guided-finish__saved--error" role="alert">
            {t('guided.builderSaveFailed')}
          </p>
        ) : null}

        <div className="guided-builder__actions">
          <button
            className="workout-primary-button"
            disabled={text.trim() === ''}
            onClick={handleImport}
            type="button"
          >
            <Check size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('guided.importAction')}
          </button>
          <button
            className="workout-secondary-button"
            disabled={text.trim() === ''}
            onClick={handleCheck}
            type="button"
          >
            {t('guided.importCheck')}
          </button>
          <button className="workout-secondary-button" onClick={onCancel} type="button">
            {t('guided.builderCancel')}
          </button>
        </div>
      </section>
    </div>
  )
}
