import { Library, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ExerciseCard } from '../components/ExerciseCard'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { ExerciseFilters, type MediaFilter } from '../components/ExerciseFilters'
import {
  type Difficulty,
  type EquipmentTag,
  type ExerciseCategory,
  type LibraryExercise,
} from '../data/exerciseLibrary'
import { getExerciseVideo } from '../utils/mediaUtils'
import { getCustomExerciseLibrary } from '../utils/settingsUtils'

type CategoryFilter = ExerciseCategory | 'All'
type EquipmentFilter = EquipmentTag | 'All'
type DifficultyFilter = Difficulty | 'All'

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All')
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentFilter>('All')
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>('All')
  const [selectedMedia, setSelectedMedia] = useState<MediaFilter>('All')
  const [viewingExercise, setViewingExercise] = useState<LibraryExercise | null>(
    null,
  )
  const library = useMemo(() => getCustomExerciseLibrary(), [])

  const filtersActive =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedEquipment !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedMedia !== 'All'

  const filteredExercises = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return library.filter((exercise) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        exercise.category === selectedCategory ||
        (selectedCategory === 'Posture' && exercise.postureFocus === true)

      const matchesEquipment =
        selectedEquipment === 'All' ||
        exercise.equipment.includes(selectedEquipment)

      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        exercise.difficulty === selectedDifficulty

      const matchesMedia =
        selectedMedia === 'All' ||
        (selectedMedia === 'Has video' && getExerciseVideo(exercise) !== '') ||
        (selectedMedia === 'Has image' &&
          typeof exercise.imageUrl === 'string' &&
          exercise.imageUrl.trim() !== '')

      const matchesSearch =
        query === '' ||
        [
          exercise.name,
          exercise.category,
          exercise.formCue,
          ...exercise.primaryMuscles,
          ...exercise.secondaryMuscles,
          ...exercise.equipment,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return (
        matchesCategory &&
        matchesEquipment &&
        matchesDifficulty &&
        matchesMedia &&
        matchesSearch
      )
    })
  }, [
    library,
    searchTerm,
    selectedCategory,
    selectedEquipment,
    selectedDifficulty,
    selectedMedia,
  ])

  function resetFilters() {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedEquipment('All')
    setSelectedDifficulty('All')
    setSelectedMedia('All')
  }

  return (
    <section className="exercise-library-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Exercise Library</p>
          <h1>Exercise Library</h1>
          <p>
            Learn form, muscles worked, mistakes, and progressions for your
            workout plan.
          </p>
        </div>
        <div className="hero-target">
          <Library size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>Exercises</span>
          <strong>{library.length} in your plan</strong>
        </div>
      </header>

      <ExerciseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedEquipment={selectedEquipment}
        setSelectedEquipment={setSelectedEquipment}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
      />

      <div className="exercise-results-row">
        <p className="exercise-results-count">
          {filteredExercises.length}{' '}
          {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
        </p>
        {filtersActive ? (
          <button
            className="exercise-reset-button"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw size={16} strokeWidth={2.4} aria-hidden="true" />
            Reset filters
          </button>
        ) : null}
      </div>

      {filteredExercises.length > 0 ? (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              exercise={exercise}
              key={exercise.id}
              onView={setViewingExercise}
            />
          ))}
        </div>
      ) : (
        <div className="exercise-empty-state">
          <p>No exercises found. Try changing filters.</p>
          <button
            className="workout-secondary-button"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
            Reset filters
          </button>
        </div>
      )}

      {viewingExercise ? (
        <ExerciseDetailModal
          exercise={viewingExercise}
          onClose={() => setViewingExercise(null)}
        />
      ) : null}
    </section>
  )
}
