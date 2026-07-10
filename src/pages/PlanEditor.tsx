import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Database,
  Dumbbell,
  Library,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  difficultyOptions,
  exerciseCategories,
  type LibraryExercise,
} from '../data/exerciseLibrary'
import { weeklyPlan, type Exercise, type WorkoutDay } from '../data/workoutPlan'
import {
  createPlanExerciseFromLibrary,
  getCustomExerciseLibrary,
  getCustomWorkoutPlan,
  getExerciseTargetLabel,
  isDefaultLibraryExercise,
  resetCustomExerciseLibrary,
  resetCustomWorkoutPlan,
  saveCustomExerciseLibrary,
  saveCustomWorkoutPlan,
} from '../utils/settingsUtils'

type PlanEditorTab = 'weekly' | 'library' | 'reset'
type AddMode = 'library' | 'manual'
type EditableExercise = Exercise & {
  category?: string
  notes?: string
}
type EditableWorkoutDay = Omit<WorkoutDay, 'exercises'> & {
  exercises: EditableExercise[]
  notes?: string
}

const tabs: Array<{
  id: PlanEditorTab
  icon: typeof CalendarDays
  label: string
}> = [
  { id: 'weekly', icon: CalendarDays, label: 'Weekly Plan' },
  { id: 'library', icon: Library, label: 'Exercise Library' },
  { id: 'reset', icon: Database, label: 'Reset/Backup' },
]

const blankManualExercise = {
  category: 'Chest',
  duration: '',
  equipment: 'Bodyweight',
  formTips: '',
  muscleGroup: 'Other',
  name: '',
  notes: '',
  repRange: '',
  restSeconds: 60,
  sets: 3,
}

export function PlanEditor() {
  const [activeTab, setActiveTab] = useState<PlanEditorTab>('weekly')
  const [plan, setPlan] = useState<EditableWorkoutDay[]>(() =>
    getCustomWorkoutPlan(),
  )
  const [library, setLibrary] = useState<LibraryExercise[]>(() =>
    getCustomExerciseLibrary(),
  )
  const [selectedDayNumber, setSelectedDayNumber] = useState(1)
  const [addMode, setAddMode] = useState<AddMode>('library')
  const [selectedLibraryId, setSelectedLibraryId] = useState(
    () => getCustomExerciseLibrary()[0]?.id ?? '',
  )
  const [manualExercise, setManualExercise] = useState(blankManualExercise)
  const [librarySearch, setLibrarySearch] = useState('')
  const [editingLibraryExercise, setEditingLibraryExercise] = useState<
    LibraryExercise
  >(() => createBlankLibraryExercise())
  const [notice, setNotice] = useState('')

  const selectedDay = useMemo(
    () =>
      plan.find((day) => day.day === selectedDayNumber) ??
      plan[0] ??
      (weeklyPlan[0] as EditableWorkoutDay),
    [plan, selectedDayNumber],
  )

  const selectedLibraryExercise = useMemo(
    () => library.find((exercise) => exercise.id === selectedLibraryId) ?? library[0],
    [library, selectedLibraryId],
  )

  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLowerCase()
    if (!query) {
      return library
    }

    return library.filter((exercise) =>
      [
        exercise.name,
        exercise.category,
        ...exercise.primaryMuscles,
        ...exercise.secondaryMuscles,
        ...exercise.equipment,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [library, librarySearch])

  function updateDay(dayNumber: number, updates: Partial<EditableWorkoutDay>) {
    setPlan((current) =>
      current.map((day) => (day.day === dayNumber ? { ...day, ...updates } : day)),
    )
  }

  function updateExercise(
    dayNumber: number,
    exerciseIndex: number,
    updates: Partial<EditableExercise>,
  ) {
    setPlan((current) =>
      current.map((day) =>
        day.day === dayNumber
          ? {
              ...day,
              exercises: day.exercises.map((exercise, index) =>
                index === exerciseIndex ? { ...exercise, ...updates } : exercise,
              ),
            }
          : day,
      ),
    )
  }

  function savePlan(message = 'Plan saved.') {
    const saved = saveCustomWorkoutPlan(plan)
    setPlan(saved)
    setNotice(message)
  }

  function commitPlan(nextPlan: EditableWorkoutDay[], message: string) {
    const saved = saveCustomWorkoutPlan(nextPlan)
    setPlan(saved)
    setNotice(message)
  }

  function deleteDayExercises(dayNumber: number) {
    const confirmed = window.confirm('Delete all exercises for this day?')
    if (!confirmed) {
      return
    }

    commitPlan(
      plan.map((day) =>
        day.day === dayNumber ? { ...day, exercises: [] } : day,
      ),
      'Day exercises deleted.',
    )
  }

  function resetDay(dayNumber: number) {
    const defaultDay = weeklyPlan.find((day) => day.day === dayNumber)
    if (!defaultDay) {
      return
    }

    commitPlan(
      plan.map((day) =>
        day.day === dayNumber
          ? (clone(defaultDay) as EditableWorkoutDay)
          : day,
      ),
      `Day ${dayNumber} reset to default.`,
    )
  }

  function removeExercise(dayNumber: number, exerciseIndex: number) {
    commitPlan(
      plan.map((day) =>
        day.day === dayNumber
          ? {
              ...day,
              exercises: day.exercises.filter((_, index) => index !== exerciseIndex),
            }
          : day,
      ),
      'Exercise removed.',
    )
  }

  function moveExercise(
    dayNumber: number,
    exerciseIndex: number,
    direction: 'up' | 'down',
  ) {
    const nextPlan = plan.map((day) => {
      if (day.day !== dayNumber) {
        return day
      }

      const nextExercises = [...day.exercises]
      const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1
      if (targetIndex < 0 || targetIndex >= nextExercises.length) {
        return day
      }

      const [exercise] = nextExercises.splice(exerciseIndex, 1)
      nextExercises.splice(targetIndex, 0, exercise)
      return { ...day, exercises: nextExercises }
    })

    commitPlan(nextPlan, 'Exercise order updated.')
  }

  function addLibraryExerciseToDay() {
    if (!selectedLibraryExercise) {
      setNotice('Choose an exercise first.')
      return
    }

    const exercise = createPlanExerciseFromLibrary(selectedLibraryExercise)
    addExerciseToDay(selectedDay.day, {
      ...exercise,
      id: uniqueExerciseId(exercise.id, selectedDay.exercises),
    })
  }

  function addManualExerciseToDay() {
    if (!manualExercise.name.trim()) {
      setNotice('Exercise name is required.')
      return
    }

    addExerciseToDay(selectedDay.day, {
      category: manualExercise.category,
      duration: manualExercise.duration.trim(),
      equipment: manualExercise.equipment.trim() || 'Bodyweight',
      formTips: parseLines(manualExercise.formTips),
      id: uniqueExerciseId(
        `custom-${slugify(manualExercise.name)}-${Date.now()}`,
        selectedDay.exercises,
      ),
      muscleGroup: manualExercise.muscleGroup.trim() || 'Other',
      name: manualExercise.name.trim(),
      notes: manualExercise.notes.trim(),
      repRange: manualExercise.repRange.trim(),
      restSeconds: Number(manualExercise.restSeconds) || 60,
      sets: Number(manualExercise.sets) || 1,
    })
    setManualExercise(blankManualExercise)
  }

  function addExerciseToDay(dayNumber: number, exercise: EditableExercise) {
    commitPlan(
      plan.map((day) =>
        day.day === dayNumber
          ? { ...day, exercises: [...day.exercises, exercise] }
          : day,
      ),
      `Added ${exercise.name}.`,
    )
  }

  function resetEntirePlan() {
    const confirmed = window.confirm(
      'Are you sure? This will remove your custom workout plan.',
    )
    if (!confirmed) {
      return
    }

    setPlan(resetCustomWorkoutPlan())
    setNotice('Workout plan reset to default.')
  }

  function saveLibraryExercise() {
    const draft = {
      ...editingLibraryExercise,
      id: editingLibraryExercise.id.startsWith('custom-new')
        ? `custom-${slugify(editingLibraryExercise.name)}-${Date.now()}`
        : editingLibraryExercise.id,
      name: editingLibraryExercise.name.trim() || 'Custom Exercise',
    }
    const existing = library.some((exercise) => exercise.id === draft.id)
    const next = existing
      ? library.map((exercise) => (exercise.id === draft.id ? draft : exercise))
      : [...library, draft]
    const saved = saveCustomExerciseLibrary(next)

    setLibrary(saved)
    setEditingLibraryExercise(
      saved.find((exercise) => exercise.id === draft.id) ?? draft,
    )
    setSelectedLibraryId(draft.id)
    setNotice('Exercise library saved.')
  }

  function deleteCustomLibraryExercise() {
    if (isDefaultLibraryExercise(editingLibraryExercise.id)) {
      setNotice('Default exercises can be reset, not deleted from source.')
      return
    }

    const confirmed = window.confirm('Delete this custom exercise?')
    if (!confirmed) {
      return
    }

    const next = library.filter(
      (exercise) => exercise.id !== editingLibraryExercise.id,
    )
    const saved = saveCustomExerciseLibrary(next)
    setLibrary(saved)
    setEditingLibraryExercise(createBlankLibraryExercise())
    setSelectedLibraryId(saved[0]?.id ?? '')
    setNotice('Custom exercise deleted.')
  }

  function resetLibrary() {
    const confirmed = window.confirm('Reset exercise library to default?')
    if (!confirmed) {
      return
    }

    const defaults = resetCustomExerciseLibrary()
    setLibrary(defaults)
    setSelectedLibraryId(defaults[0]?.id ?? '')
    setEditingLibraryExercise(createBlankLibraryExercise())
    setNotice('Exercise library reset to default.')
  }

  return (
    <section className="plan-editor-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Plan Editor</p>
          <h1>Settings + Plan Editor</h1>
          <p>
            Edit the weekly plan, exercise targets, form notes, and local
            exercise library.
          </p>
        </div>
        <div className="hero-target">
          <SlidersHorizontal size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>Active source</span>
          <strong>localStorage override</strong>
        </div>
      </header>

      <div className="settings-tabs" role="tablist" aria-label="Plan editor sections">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              aria-selected={activeTab === tab.id}
              className="settings-tab"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {notice ? (
        <div className="settings-notice" role="status">
          <SlidersHorizontal size={18} strokeWidth={2.4} aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      {activeTab === 'weekly' ? (
        <>
          <div className="plan-day-grid">
            {plan.map((day) => (
              <article
                className={`dashboard-card plan-day-card${
                  selectedDayNumber === day.day ? ' plan-day-card--active' : ''
                }`}
                key={day.day}
              >
                <div className="weekly-day-card__head">
                  <div>
                    <p className="eyebrow">Day {day.day}</p>
                    <h2>{day.name}</h2>
                  </div>
                  <span className="weekly-day-time">{day.estimatedTime}</span>
                </div>

                <div className="weekly-focus-row">
                  {day.focus.map((focus) => (
                    <span className="weekly-focus-chip" key={focus}>
                      {focus}
                    </span>
                  ))}
                </div>

                <ul className="weekly-exercise-list">
                  {day.exercises.map((exercise) => (
                    <li className="weekly-exercise-row" key={exercise.id}>
                      <div className="weekly-exercise-info">
                        <span className="weekly-exercise-name weekly-exercise-name--static">
                          {exercise.name}
                        </span>
                        <span className="weekly-exercise-target">
                          {getExerciseTargetLabel(exercise)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="plan-card-actions">
                  <button
                    className="workout-secondary-button"
                    onClick={() => setSelectedDayNumber(day.day)}
                    type="button"
                  >
                    Edit Day
                  </button>
                  <button
                    className="workout-secondary-button"
                    onClick={() => {
                      setSelectedDayNumber(day.day)
                      setAddMode('library')
                    }}
                    type="button"
                  >
                    Add Exercise
                  </button>
                  <button
                    className="workout-secondary-button workout-secondary-button--danger"
                    onClick={() => deleteDayExercises(day.day)}
                    type="button"
                  >
                    Delete Day Exercises
                  </button>
                  <button
                    className="workout-secondary-button"
                    onClick={() => resetDay(day.day)}
                    type="button"
                  >
                    Reset Day to Default
                  </button>
                </div>
              </article>
            ))}
          </div>

          <article className="dashboard-card plan-edit-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Edit Workout Day</p>
                <h2>Day {selectedDay.day}</h2>
              </div>
              <CalendarDays size={22} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <div className="settings-form-grid">
              <label className="settings-field">
                Day name
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateDay(selectedDay.day, { name: event.target.value })
                  }
                  type="text"
                  value={selectedDay.name}
                />
              </label>
              <label className="settings-field">
                Focus
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateDay(selectedDay.day, {
                      focus: parseCommaList(event.target.value),
                    })
                  }
                  type="text"
                  value={selectedDay.focus.join(', ')}
                />
              </label>
              <label className="settings-field">
                Estimated minutes
                <input
                  className="settings-input"
                  onChange={(event) =>
                    updateDay(selectedDay.day, {
                      estimatedTime: event.target.value,
                    })
                  }
                  type="text"
                  value={selectedDay.estimatedTime}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Notes
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    updateDay(selectedDay.day, { notes: event.target.value })
                  }
                  value={selectedDay.notes ?? ''}
                />
              </label>
            </div>

            <div className="settings-actions">
              <button
                className="workout-primary-button"
                onClick={() => savePlan(`Day ${selectedDay.day} saved.`)}
                type="button"
              >
                <Save size={19} strokeWidth={2.4} aria-hidden="true" />
                Save Day
              </button>
            </div>
          </article>

          <article className="dashboard-card plan-edit-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Edit Exercises in Plan</p>
                <h2>{selectedDay.name}</h2>
              </div>
              <Dumbbell size={22} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <div className="plan-exercise-editor-list">
              {selectedDay.exercises.map((exercise, index) => (
                <section className="plan-exercise-editor" key={`${exercise.id}-${index}`}>
                  <div className="plan-exercise-editor__head">
                    <div>
                      <p className="eyebrow">Exercise {index + 1}</p>
                      <h3>{exercise.name}</h3>
                    </div>
                    <span className="status-pill">
                      {getExerciseTargetLabel(exercise)}
                    </span>
                  </div>

                  <div className="settings-form-grid">
                    <label className="settings-field">
                      Exercise name
                      <input
                        className="settings-input"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            name: event.target.value,
                          })
                        }
                        type="text"
                        value={exercise.name}
                      />
                    </label>
                    <label className="settings-field">
                      Sets
                      <input
                        className="settings-input"
                        min={1}
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            sets: Number(event.target.value),
                          })
                        }
                        type="number"
                        value={exercise.sets}
                      />
                    </label>
                    <label className="settings-field">
                      Rep range
                      <input
                        className="settings-input"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            repRange: event.target.value,
                          })
                        }
                        type="text"
                        value={exercise.repRange ?? ''}
                      />
                    </label>
                    <label className="settings-field">
                      Duration
                      <input
                        className="settings-input"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            duration: event.target.value,
                          })
                        }
                        type="text"
                        value={exercise.duration ?? ''}
                      />
                    </label>
                    <label className="settings-field">
                      Rest seconds
                      <input
                        className="settings-input"
                        min={0}
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            restSeconds: Number(event.target.value),
                          })
                        }
                        type="number"
                        value={exercise.restSeconds}
                      />
                    </label>
                    <label className="settings-field">
                      Muscle group
                      <input
                        className="settings-input"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            muscleGroup: event.target.value,
                          })
                        }
                        type="text"
                        value={exercise.muscleGroup}
                      />
                    </label>
                    <label className="settings-field">
                      Equipment
                      <input
                        className="settings-input"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            equipment: event.target.value,
                          })
                        }
                        type="text"
                        value={exercise.equipment}
                      />
                    </label>
                    <label className="settings-field settings-field--wide">
                      Form tips
                      <textarea
                        className="settings-textarea"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            formTips: parseLines(event.target.value),
                          })
                        }
                        value={(exercise.formTips ?? []).join('\n')}
                      />
                    </label>
                    <label className="settings-field settings-field--wide">
                      Notes
                      <textarea
                        className="settings-textarea"
                        onChange={(event) =>
                          updateExercise(selectedDay.day, index, {
                            notes: event.target.value,
                          })
                        }
                        value={exercise.notes ?? ''}
                      />
                    </label>
                  </div>

                  <div className="plan-exercise-actions">
                    <button
                      className="workout-primary-button"
                      onClick={() => savePlan(`${exercise.name} saved.`)}
                      type="button"
                    >
                      <Save size={19} strokeWidth={2.4} aria-hidden="true" />
                      Save Exercise
                    </button>
                    <button
                      className="workout-secondary-button"
                      disabled={index === 0}
                      onClick={() => moveExercise(selectedDay.day, index, 'up')}
                      type="button"
                    >
                      <ArrowUp size={19} strokeWidth={2.4} aria-hidden="true" />
                      Move Up
                    </button>
                    <button
                      className="workout-secondary-button"
                      disabled={index === selectedDay.exercises.length - 1}
                      onClick={() => moveExercise(selectedDay.day, index, 'down')}
                      type="button"
                    >
                      <ArrowDown size={19} strokeWidth={2.4} aria-hidden="true" />
                      Move Down
                    </button>
                    <button
                      className="workout-secondary-button workout-secondary-button--danger"
                      onClick={() => removeExercise(selectedDay.day, index)}
                      type="button"
                    >
                      <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
                      Remove Exercise
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </article>

          <article className="dashboard-card plan-edit-panel">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Add Exercise to Day</p>
                <h2>Day {selectedDay.day}</h2>
              </div>
              <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <div className="segmented-control" role="tablist" aria-label="Add exercise mode">
              <button
                aria-selected={addMode === 'library'}
                onClick={() => setAddMode('library')}
                type="button"
              >
                From Library
              </button>
              <button
                aria-selected={addMode === 'manual'}
                onClick={() => setAddMode('manual')}
                type="button"
              >
                Custom
              </button>
            </div>

            {addMode === 'library' ? (
              <div className="settings-form-grid">
                <label className="settings-field settings-field--wide">
                  Exercise Library
                  <select
                    className="settings-input"
                    onChange={(event) => setSelectedLibraryId(event.target.value)}
                    value={selectedLibraryId}
                  >
                    {library.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="workout-primary-button"
                  onClick={addLibraryExerciseToDay}
                  type="button"
                >
                  <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
                  Add Selected Exercise
                </button>
              </div>
            ) : (
              <>
                <div className="settings-form-grid">
                  <label className="settings-field">
                    Exercise name
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      type="text"
                      value={manualExercise.name}
                    />
                  </label>
                  <label className="settings-field">
                    Category
                    <select
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      value={manualExercise.category}
                    >
                      {exerciseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="settings-field">
                    Muscle group
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          muscleGroup: event.target.value,
                        }))
                      }
                      type="text"
                      value={manualExercise.muscleGroup}
                    />
                  </label>
                  <label className="settings-field">
                    Equipment
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          equipment: event.target.value,
                        }))
                      }
                      type="text"
                      value={manualExercise.equipment}
                    />
                  </label>
                  <label className="settings-field">
                    Sets
                    <input
                      className="settings-input"
                      min={1}
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          sets: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={manualExercise.sets}
                    />
                  </label>
                  <label className="settings-field">
                    Rep range
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          repRange: event.target.value,
                        }))
                      }
                      type="text"
                      value={manualExercise.repRange}
                    />
                  </label>
                  <label className="settings-field">
                    Duration
                    <input
                      className="settings-input"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          duration: event.target.value,
                        }))
                      }
                      type="text"
                      value={manualExercise.duration}
                    />
                  </label>
                  <label className="settings-field">
                    Rest seconds
                    <input
                      className="settings-input"
                      min={0}
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          restSeconds: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={manualExercise.restSeconds}
                    />
                  </label>
                  <label className="settings-field settings-field--wide">
                    Form tips
                    <textarea
                      className="settings-textarea"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          formTips: event.target.value,
                        }))
                      }
                      value={manualExercise.formTips}
                    />
                  </label>
                  <label className="settings-field settings-field--wide">
                    Notes
                    <textarea
                      className="settings-textarea"
                      onChange={(event) =>
                        setManualExercise((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      value={manualExercise.notes}
                    />
                  </label>
                </div>
                <div className="settings-actions">
                  <button
                    className="workout-primary-button"
                    onClick={addManualExerciseToDay}
                    type="button"
                  >
                    <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
                    Add Custom Exercise
                  </button>
                </div>
              </>
            )}
          </article>
        </>
      ) : null}

      {activeTab === 'library' ? (
        <div className="library-editor-layout">
          <article className="dashboard-card library-editor-list">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Exercise Library Editor</p>
                <h2>{library.length} exercises</h2>
              </div>
              <Library size={22} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <button
              className="workout-primary-button"
              onClick={() => setEditingLibraryExercise(createBlankLibraryExercise())}
              type="button"
            >
              <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
              Add New Exercise
            </button>

            <label className="exercise-search library-search">
              <Search size={18} strokeWidth={2.4} aria-hidden="true" />
              <input
                onChange={(event) => setLibrarySearch(event.target.value)}
                placeholder="Search exercises"
                type="search"
                value={librarySearch}
              />
            </label>

            <div className="library-result-list">
              {filteredLibrary.map((exercise) => (
                <button
                  className="library-result-button"
                  key={exercise.id}
                  onClick={() => setEditingLibraryExercise(clone(exercise))}
                  type="button"
                >
                  <span>{exercise.name}</span>
                  <small>{exercise.category}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="dashboard-card library-editor-form">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Edit Existing Exercise</p>
                <h2>{editingLibraryExercise.name || 'New exercise'}</h2>
              </div>
              <Dumbbell size={22} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <div className="settings-form-grid">
              <label className="settings-field">
                Name
                <input
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  type="text"
                  value={editingLibraryExercise.name}
                />
              </label>
              <label className="settings-field">
                Category
                <select
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      category: event.target.value as LibraryExercise['category'],
                    }))
                  }
                  value={editingLibraryExercise.category}
                >
                  {exerciseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                Primary muscles
                <input
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      primaryMuscles: parseCommaList(event.target.value),
                    }))
                  }
                  type="text"
                  value={editingLibraryExercise.primaryMuscles.join(', ')}
                />
              </label>
              <label className="settings-field">
                Secondary muscles
                <input
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      secondaryMuscles: parseCommaList(event.target.value),
                    }))
                  }
                  type="text"
                  value={editingLibraryExercise.secondaryMuscles.join(', ')}
                />
              </label>
              <label className="settings-field">
                Equipment
                <input
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      equipment: parseCommaList(
                        event.target.value,
                      ) as LibraryExercise['equipment'],
                    }))
                  }
                  type="text"
                  value={editingLibraryExercise.equipment.join(', ')}
                />
              </label>
              <label className="settings-field">
                Difficulty
                <select
                  className="settings-input"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      difficulty: event.target.value as LibraryExercise['difficulty'],
                    }))
                  }
                  value={editingLibraryExercise.difficulty}
                >
                  {difficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-field settings-field--wide">
                Instructions
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      instructions: parseLines(event.target.value),
                    }))
                  }
                  value={editingLibraryExercise.instructions.join('\n')}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Form tips
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      formTips: parseLines(event.target.value),
                    }))
                  }
                  value={editingLibraryExercise.formTips.join('\n')}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Common mistakes
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      commonMistakes: parseLines(event.target.value),
                    }))
                  }
                  value={editingLibraryExercise.commonMistakes.join('\n')}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Progression
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      progression: parseLines(event.target.value),
                    }))
                  }
                  value={editingLibraryExercise.progression.join('\n')}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Regression
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      regression: parseLines(event.target.value),
                    }))
                  }
                  value={editingLibraryExercise.regression.join('\n')}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Posture notes
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      postureNotes: event.target.value,
                    }))
                  }
                  value={editingLibraryExercise.postureNotes}
                />
              </label>
              <label className="settings-field settings-field--wide">
                Demo links
                <textarea
                  className="settings-textarea"
                  onChange={(event) =>
                    setEditingLibraryExercise((current) => ({
                      ...current,
                      demoLinks: parseDemoLinks(event.target.value),
                    }))
                  }
                  value={formatDemoLinks(editingLibraryExercise.demoLinks)}
                />
              </label>
            </div>

            <div className="plan-exercise-actions">
              <button
                className="workout-primary-button"
                onClick={saveLibraryExercise}
                type="button"
              >
                <Save size={19} strokeWidth={2.4} aria-hidden="true" />
                Save Exercise
              </button>
              <button
                className="workout-secondary-button workout-secondary-button--danger"
                disabled={isDefaultLibraryExercise(editingLibraryExercise.id)}
                onClick={deleteCustomLibraryExercise}
                type="button"
              >
                <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
                Delete Custom Exercise
              </button>
              <button
                className="workout-secondary-button"
                onClick={resetLibrary}
                type="button"
              >
                <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
                Reset Library to Default
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {activeTab === 'reset' ? (
        <article className="dashboard-card settings-panel">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Reset/Backup</p>
              <h2>Plan and library resets</h2>
            </div>
            <Database size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="backup-action-grid">
            <button
              className="workout-secondary-button workout-secondary-button--danger"
              onClick={resetEntirePlan}
              type="button"
            >
              <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Reset Entire Plan to Default
            </button>
            <button
              className="workout-secondary-button"
              onClick={resetLibrary}
              type="button"
            >
              <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Reset Library to Default
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}

function createBlankLibraryExercise(): LibraryExercise {
  return {
    category: 'Chest',
    commonMistakes: [],
    demoLinks: [],
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    formCue: '',
    formTips: [],
    id: `custom-new-${Date.now()}`,
    instructions: [],
    name: '',
    postureNotes: '',
    primaryMuscles: ['Other'],
    progression: [],
    regression: [],
    relatedWorkoutDays: [],
    secondaryMuscles: [],
  }
}

function parseLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseDemoLinks(value: string) {
  return value.split('\n').flatMap((line) => {
    const [label, url] = line.split('|').map((part) => part.trim())
    return label && url ? [{ label, url }] : []
  })
}

function formatDemoLinks(links: LibraryExercise['demoLinks']) {
  return links.map((link) => `${link.label} | ${link.url}`).join('\n')
}

function uniqueExerciseId(baseId: string, exercises: EditableExercise[]) {
  if (!exercises.some((exercise) => exercise.id === baseId)) {
    return baseId
  }

  return `${baseId}-${Date.now()}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}
