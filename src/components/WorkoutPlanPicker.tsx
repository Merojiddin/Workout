import { Building2, Home, Plus, X } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { TrainingLocation } from '../data/workoutPlan'
import { useT } from '../i18n'
import { saveUserWorkoutProgramsToCloud } from '../services/settingsService'
import type { ActiveWorkoutProgram } from '../utils/activeWorkoutProgram'
import { getUserWorkoutPrograms } from '../utils/userWorkoutPrograms'
import {
  getPreferredWorkoutProgram,
  getProgramsForLocation,
  selectWorkoutProgram,
  selectWorkoutTrainingLocation,
} from '../utils/workoutProgramLibrary'

const PasteProgramPanel = lazy(() =>
  import('./WorkoutProgramManager').then((module) => ({ default: module.PasteProgramPanel })),
)

interface WorkoutPlanPickerProps {
  activeProgram: ActiveWorkoutProgram
  location: TrainingLocation
  paused: boolean
  onChanged: (location: TrainingLocation) => void
}

export function WorkoutPlanPicker({ activeProgram, location, paused, onChanged }: WorkoutPlanPickerProps) {
  const { user } = useAuth()
  const t = useT()
  const [busy, setBusy] = useState(false)
  const changing = useRef(false)
  const [showAdd, setShowAdd] = useState(false)
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null)
  const programs = getProgramsForLocation(location)
  const selected = programs.find((program) =>
    program.id === activeProgram.programId && program.version === activeProgram.programVersion,
  )
  const locationName = t(location === 'home' ? 'workout.locationHome' : 'workout.locationGym')

  async function chooseProgram(program: { id: string; version: string }, nextLocation = location) {
    if (changing.current) return
    changing.current = true
    setBusy(true)
    setNotice(null)
    try {
      const result = await selectWorkoutProgram(program, nextLocation, user)
      if (result.success) {
        onChanged(nextLocation)
      } else {
        setNotice({ message: result.message, error: true })
      }
    } catch {
      setNotice({ message: t('workout.planSwitchFailed'), error: true })
    } finally {
      changing.current = false
      setBusy(false)
    }
  }

  async function chooseLocation(next: TrainingLocation) {
    if (changing.current || next === location) return
    setShowAdd(false)
    const preferred = getPreferredWorkoutProgram(next)
    if (preferred) {
      await chooseProgram(preferred, next)
      return
    }
    // An empty collection is browsable without overwriting the installed plan.
    const result = selectWorkoutTrainingLocation(next, user)
    if (result.success) {
      onChanged(next)
      setNotice(null)
    } else {
      setNotice({ message: result.message, error: true })
    }
  }

  return (
    <section className="workout-plan-picker" aria-label={t('workout.planLibrary')} aria-busy={busy}>
      <div className="location-toggle" role="group" aria-label={t('workout.trainingLocation')}>
        <button type="button" aria-pressed={location === 'home'} className={location === 'home' ? 'is-active' : ''}
          disabled={busy || paused} onClick={() => void chooseLocation('home')}>
          <Home size={16} strokeWidth={2.4} aria-hidden="true" />{t('workout.locationHome')}
        </button>
        <button type="button" aria-pressed={location === 'gym'} className={location === 'gym' ? 'is-active' : ''}
          disabled={busy || paused} onClick={() => void chooseLocation('gym')}>
          <Building2 size={16} strokeWidth={2.4} aria-hidden="true" />{t('workout.locationGym')}
        </button>
      </div>
      <div className="workout-plan-picker__row">
        <label htmlFor="workout-plan-choice">
          <span>{t('workout.plansForLocation', { location: locationName, count: programs.length })}</span>
          <select id="workout-plan-choice" disabled={busy || paused || programs.length === 0}
            value={selected ? JSON.stringify([selected.id, selected.version]) : ''}
            onChange={(event) => {
              const program = programs.find((item) => JSON.stringify([item.id, item.version]) === event.target.value)
              if (program) void chooseProgram(program)
            }}>
            {!selected ? <option value="">{activeProgram.source === 'custom' ? activeProgram.programName : t('workout.choosePlan')}</option> : null}
            {programs.map((program) => (
              <option key={JSON.stringify([program.id, program.version])} value={JSON.stringify([program.id, program.version])}>
                {program.name} · {program.version}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="workout-secondary-button" aria-expanded={showAdd}
          disabled={busy} onClick={() => setShowAdd((open) => !open)}>
          {showAdd ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {showAdd ? t('workout.closeAddPlan') : t('workout.addPlan')}
        </button>
      </div>
      <p className="workout-plan-picker__hint">{t('workout.planLibraryHint')}</p>
      {paused ? <p className="workout-plan-picker__hint">{t('workout.finishBeforeSwitch')}</p> : null}
      {busy ? <p role="status">{t('workout.switchingPlan')}</p> : null}
      {notice ? <p className={notice.error ? 'workout-plan-picker__error' : 'workout-plan-picker__hint'} role={notice.error ? 'alert' : 'status'}>{notice.message}</p> : null}
      {showAdd ? (
        <Suspense fallback={<p role="status">{t('workout.loadingPlanForm')}</p>}>
          <PasteProgramPanel defaultLocation={location} initiallyOpen showSavedPrograms={false}
            savedPrograms={getUserWorkoutPrograms()}
            onSaved={(message, savedPrograms) => {
              setNotice({ message, error: false })
              setShowAdd(false)
              onChanged(location)
              saveUserWorkoutProgramsToCloud(user, savedPrograms).catch(() => undefined)
            }}
            onDeleted={() => onChanged(location)} />
        </Suspense>
      ) : null}
    </section>
  )
}
