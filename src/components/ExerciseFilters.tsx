import { Search } from 'lucide-react'
import { useLanguage } from '../i18n'
import {
  translateCategory,
  translateDifficulty,
  translateEquipment,
} from '../i18n/exercises'
import {
  difficultyOptions,
  equipmentOptions,
  exerciseCategories,
  type Difficulty,
  type EquipmentTag,
  type ExerciseCategory,
} from '../data/exerciseLibrary'

type CategoryFilter = ExerciseCategory | 'All'
type EquipmentFilter = EquipmentTag | 'All'
type DifficultyFilter = Difficulty | 'All'

export type MediaFilter = 'All' | 'Has video' | 'Has image'

const mediaFilterOptions: MediaFilter[] = ['Has video', 'Has image']

interface ExerciseFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCategory: CategoryFilter
  setSelectedCategory: (value: CategoryFilter) => void
  selectedEquipment: EquipmentFilter
  setSelectedEquipment: (value: EquipmentFilter) => void
  selectedDifficulty: DifficultyFilter
  setSelectedDifficulty: (value: DifficultyFilter) => void
  selectedMedia: MediaFilter
  setSelectedMedia: (value: MediaFilter) => void
}

export function ExerciseFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedEquipment,
  setSelectedEquipment,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedMedia,
  setSelectedMedia,
}: ExerciseFiltersProps) {
  const { language, t } = useLanguage()

  return (
    <section className="exercise-filters" aria-label={t('library.filtersAria')}>
      <div className="exercise-search">
        <Search size={18} strokeWidth={2.4} aria-hidden="true" />
        <input
          aria-label={t('library.searchAria')}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('library.searchPlaceholder')}
          type="search"
          value={searchTerm}
        />
      </div>

      <div className="exercise-filter-grid">
        <label className="exercise-filter-field">
          {t('library.filter.category')}
          <select
            onChange={(event) =>
              setSelectedCategory(event.target.value as CategoryFilter)
            }
            value={selectedCategory}
          >
            <option value="All">{t('library.filter.allCategories')}</option>
            {exerciseCategories.map((category) => (
              <option key={category} value={category}>
                {translateCategory(category, language)}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          {t('library.filter.equipment')}
          <select
            onChange={(event) =>
              setSelectedEquipment(event.target.value as EquipmentFilter)
            }
            value={selectedEquipment}
          >
            <option value="All">{t('library.filter.allEquipment')}</option>
            {equipmentOptions.map((item) => (
              <option key={item} value={item}>
                {translateEquipment(item, language)}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          {t('library.filter.difficulty')}
          <select
            onChange={(event) =>
              setSelectedDifficulty(event.target.value as DifficultyFilter)
            }
            value={selectedDifficulty}
          >
            <option value="All">{t('library.filter.allLevels')}</option>
            {difficultyOptions.map((level) => (
              <option key={level} value={level}>
                {translateDifficulty(level, language)}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          {t('library.filter.media')}
          <select
            onChange={(event) =>
              setSelectedMedia(event.target.value as MediaFilter)
            }
            value={selectedMedia}
          >
            <option value="All">{t('library.filter.allMedia')}</option>
            {mediaFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'Has video'
                  ? t('library.filter.hasVideo')
                  : t('library.filter.hasImage')}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
