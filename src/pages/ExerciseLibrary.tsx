import { Library, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ExerciseCard } from '../components/ExerciseCard'
import { getExerciseCopy } from '../i18n/exercises'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { ExerciseFilters, type MediaFilter } from '../components/ExerciseFilters'
import {
  type Difficulty,
  type EquipmentTag,
  type ExerciseCategory,
  type LibraryExercise,
} from '../data/exerciseLibrary'
import { useLanguage } from '../i18n'
import { getExerciseVideo } from '../utils/mediaUtils'
import {
  getCustomExerciseLibraryOverrides,
  getEffectiveExerciseLibrary,
  saveCustomExerciseLibrary,
} from '../utils/settingsUtils'

type CategoryFilter = ExerciseCategory | 'All'
type EquipmentFilter = EquipmentTag | 'All'
type DifficultyFilter = Difficulty | 'All'

export function ExerciseLibrary() {
  const { language, t } = useLanguage()
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
  const [library, setLibrary] = useState<LibraryExercise[]>(() =>
    getEffectiveExerciseLibrary(),
  )

  function handleExerciseUpdate(updated: LibraryExercise) {
    const currentOverrides = getCustomExerciseLibraryOverrides() as LibraryExercise[]
    const nextOverrides = currentOverrides.some(
      (exercise) => exercise.id === updated.id,
    )
      ? currentOverrides.map((exercise) =>
          exercise.id === updated.id ? updated : exercise,
        )
      : [...currentOverrides, updated]

    saveCustomExerciseLibrary(
      getCustomExerciseLibraryOverrides(nextOverrides),
    )
    const effectiveLibrary = getEffectiveExerciseLibrary() as LibraryExercise[]
    setLibrary(effectiveLibrary)
    setViewingExercise(
      effectiveLibrary.find((exercise) => exercise.id === updated.id) ?? null,
    )
  }

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

      // Searched against both languages: someone reading the app in
      // Vietnamese may still know a movement by its English name, and the
      // reverse is true for anyone who learned it here.
      const translated = getExerciseCopy(exercise, language)
      const matchesSearch =
        query === '' ||
        [
          exercise.name,
          exercise.category,
          exercise.formCue,
          ...exercise.primaryMuscles,
          ...exercise.secondaryMuscles,
          ...exercise.equipment,
          translated.name,
          translated.formCue,
          ...translated.primaryMuscles,
          ...translated.secondaryMuscles,
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
    language,
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
          <p className="eyebrow">{t('library.eyebrow')}</p>
          <h1>{t('library.title')}</h1>
          <p>{t('library.subtitle')}</p>
        </div>
        <div className="hero-target">
          <Library size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>{t('library.countLabel')}</span>
          <strong>{t('library.countValue', { count: library.length })}</strong>
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
          {t('library.resultCount', { count: filteredExercises.length })}
        </p>
        {filtersActive ? (
          <button
            className="exercise-reset-button"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw size={16} strokeWidth={2.4} aria-hidden="true" />
            {t('library.resetFilters')}
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
          <p>{t('library.empty')}</p>
          <button
            className="workout-secondary-button"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
            {t('library.resetFilters')}
          </button>
        </div>
      )}

      {viewingExercise ? (
        <ExerciseDetailModal
          exercise={viewingExercise}
          onClose={() => setViewingExercise(null)}
          onUpdateExercise={handleExerciseUpdate}
        />
      ) : null}
    </section>
  )
}
