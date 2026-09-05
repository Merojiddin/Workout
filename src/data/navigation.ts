import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  Library,
  MoreHorizontal,
  NotebookPen,
  Settings,
  Timer,
  Utensils,
} from 'lucide-react'
import type { NavItem } from '../types/navigation'

/**
 * Four destinations plus the account tab. Today's Workout is the reason the
 * app exists, Progress is the glance back at it, Nutrition is what you read
 * after training, and everything else is a reference page reached from More.
 */
export const navigationItems: NavItem[] = [
  {
    id: 'today-workout',
    icon: Dumbbell,
    labelKey: 'nav.todayWorkout',
    shortLabelKey: 'nav.todayWorkoutShort',
  },
  { id: 'progress', icon: BarChart3, labelKey: 'nav.progress' },
  { id: 'nutrition', icon: Utensils, labelKey: 'nav.nutrition' },
  { id: 'more', icon: MoreHorizontal, labelKey: 'nav.more' },
]

/** Pages listed on the More screen, in the order they appear. */
export const moreNavigationItems: NavItem[] = [
  {
    id: 'guided-workouts',
    icon: Timer,
    labelKey: 'nav.guidedWorkouts',
    descriptionKey: 'nav.guidedWorkoutsDescription',
  },
  {
    id: 'weekly-plan',
    icon: CalendarDays,
    labelKey: 'nav.weeklyPlan',
    descriptionKey: 'nav.weeklyPlanDescription',
  },
  {
    id: 'exercise-library',
    icon: Library,
    labelKey: 'nav.exerciseLibrary',
    descriptionKey: 'nav.exerciseLibraryDescription',
  },
  {
    id: 'weekly-review',
    icon: ClipboardCheck,
    labelKey: 'nav.weeklyReview',
    descriptionKey: 'nav.weeklyReviewDescription',
  },
  {
    id: 'body-check-in',
    icon: NotebookPen,
    labelKey: 'nav.bodyCheckIn',
    descriptionKey: 'nav.bodyCheckInDescription',
  },
  {
    id: 'settings',
    icon: Settings,
    labelKey: 'nav.settings',
    descriptionKey: 'nav.settingsDescription',
  },
]
