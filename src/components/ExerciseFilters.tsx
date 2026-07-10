import { Search } from 'lucide-react'
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
  return (
    <section className="exercise-filters" aria-label="Search and filter exercises">
      <div className="exercise-search">
        <Search size={18} strokeWidth={2.4} aria-hidden="true" />
        <input
          aria-label="Search exercises"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search exercises or muscles..."
          type="search"
          value={searchTerm}
        />
      </div>

      <div className="exercise-filter-grid">
        <label className="exercise-filter-field">
          Category
          <select
            onChange={(event) =>
              setSelectedCategory(event.target.value as CategoryFilter)
            }
            value={selectedCategory}
          >
            <option value="All">All categories</option>
            {exerciseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          Equipment
          <select
            onChange={(event) =>
              setSelectedEquipment(event.target.value as EquipmentFilter)
            }
            value={selectedEquipment}
          >
            <option value="All">All equipment</option>
            {equipmentOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          Difficulty
          <select
            onChange={(event) =>
              setSelectedDifficulty(event.target.value as DifficultyFilter)
            }
            value={selectedDifficulty}
          >
            <option value="All">All levels</option>
            {difficultyOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="exercise-filter-field">
          Media
          <select
            onChange={(event) =>
              setSelectedMedia(event.target.value as MediaFilter)
            }
            value={selectedMedia}
          >
            <option value="All">All media</option>
            {mediaFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
