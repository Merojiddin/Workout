import { AlertTriangle, CheckCircle2, Copy, Dumbbell, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { installWorkoutProgramInCloud } from '../services/workoutProgramService'
import { saveUserWorkoutProgramsToCloud } from '../services/settingsService'
import {
  buildProgramAuthoringPrompt,
  parseWorkoutProgramInput,
  saveUserWorkoutProgram,
  type ParsedWorkoutProgramResult,
} from '../utils/userWorkoutPrograms'
import { getUserProfileSettings } from '../utils/settingsUtils'
import { installWorkoutProgramLocally } from '../utils/workoutProgramManager'

interface ProgramSetupProps {
  onInstalled: () => void
}

/**
 * First-run screen for an account with no program.
 *
 * No program ships with the app and nothing is inherited from another account,
 * so this is the only way in: upload a program file (or paste the JSON), and it
 * is saved to this user's own program list and installed in one step.
 */
export function ProgramSetup({ onInstalled }: ProgramSetupProps) {
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ParsedWorkoutProgramResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy AI prompt')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cloudActive = Boolean(user)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Cleared straight away so re-picking the same file after a fix re-fires.
    event.target.value = ''
    if (!file) {
      return
    }

    setError(null)
    setFileName(file.name)
    try {
      const contents = await file.text()
      setText(contents)
      setResult(parseWorkoutProgramInput(contents))
    } catch {
      setText('')
      setResult(null)
      setError(`Could not read "${file.name}". Try choosing the file again.`)
    }
  }

  async function handleInstall() {
    const parsed = result?.success ? result : parseWorkoutProgramInput(text)
    setResult(parsed)
    if (!parsed.success || !parsed.program) {
      return
    }

    setError(null)
    setBusy(true)
    try {
      const saved = saveUserWorkoutProgram(parsed.program)
      if (!saved.success) {
        setError(saved.message)
        return
      }

      const identity = {
        id: parsed.program.id,
        version: parsed.program.version,
      }

      if (cloudActive) {
        if (!isOnline) {
          setError(
            'You are offline. Reconnect to finish setting up your program.',
          )
          return
        }
        // Keep the program itself in the cloud too, so the same account can
        // set up a second device without the file on hand. A failure here is
        // not fatal: the program is already saved locally and the install below
        // is what actually matters.
        try {
          await saveUserWorkoutProgramsToCloud(user, saved.programs)
        } catch {
          // Queued for the next sync by settingsService.
        }
        const installed = await installWorkoutProgramInCloud(identity, user)
        if (!installed.success) {
          setError([installed.message, ...installed.details].join(' '))
          return
        }
      } else {
        const installed = installWorkoutProgramLocally(identity)
        if (!installed.success) {
          setError([installed.message, ...installed.details].join(' '))
          return
        }
      }

      onInstalled()
    } finally {
      setBusy(false)
    }
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(
        buildProgramAuthoringPrompt(getUserProfileSettings()),
      )
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Press Ctrl/Cmd+C')
      setText(buildProgramAuthoringPrompt(getUserProfileSettings()))
    }
    window.setTimeout(() => setCopyLabel('Copy AI prompt'), 2500)
  }

  const program = result?.success ? result.program : null

  return (
    <div className="program-setup">
      <div className="program-setup__brand" aria-hidden="true">
        <Dumbbell size={26} strokeWidth={2.4} />
      </div>
      <p className="profile-setup__step">Step 1 of 2</p>
      <h1>Add your workout program</h1>
      <p className="program-setup__subtitle">
        This app does not come with a program, and it never shows you anyone
        else&apos;s. Upload your own program file to get started - it stays
        private to your account.
      </p>

      <input
        accept="application/json,.json"
        className="paste-program__file-input"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
      <button
        className="workout-primary-button program-setup__upload"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <Upload size={18} strokeWidth={2.4} aria-hidden="true" />
        Choose program file
      </button>
      {fileName ? (
        <p className="program-setup__file-name">Loaded {fileName}</p>
      ) : null}

      <details className="program-setup__paste">
        <summary>Paste the JSON instead</summary>
        <p className="program-setup__hint">
          Have your plan as plain text? Copy this prompt into ChatGPT (or any AI
          chat) with your plan, then upload or paste the JSON it gives back.
        </p>
        <button
          className="workout-secondary-button"
          onClick={handleCopyPrompt}
          type="button"
        >
          <Copy size={17} strokeWidth={2.4} aria-hidden="true" />
          {copyLabel}
        </button>
        <textarea
          className="paste-program__textarea"
          onChange={(event) => {
            setText(event.target.value)
            setResult(null)
            setFileName(null)
          }}
          placeholder={'{\n  "name": "My Program",\n  "days": [ ... ]\n}'}
          rows={8}
          spellCheck={false}
          value={text}
        />
      </details>

      {program ? (
        <div className="paste-program__result paste-program__result--ok" role="status">
          <p className="paste-program__result-title">
            <CheckCircle2 size={17} strokeWidth={2.4} aria-hidden="true" />
            {program.name} looks good - {program.days.length} days.
          </p>
        </div>
      ) : null}

      {result && !result.success ? (
        <div className="paste-program__result paste-program__result--error" role="alert">
          <p className="paste-program__result-title">
            <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
            This program cannot be used yet.
          </p>
          <ul className="paste-program__issues">
            {result.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="paste-program__result paste-program__result--error" role="alert">
          <p className="paste-program__result-title">
            <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
            {error}
          </p>
        </div>
      ) : null}

      <button
        className="workout-primary-button program-setup__install"
        disabled={busy || text.trim() === ''}
        onClick={handleInstall}
        type="button"
      >
        {busy ? 'Setting up...' : 'Use this program'}
      </button>
    </div>
  )
}
