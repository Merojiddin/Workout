import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  Library,
  MoreHorizontal,
  NotebookPen,
  Settings,
  Utensils,
} from 'lucide-react'
import type { NavItem } from '../types/navigation'

/**
 * Four destinations plus the account tab. Today's Workout is the reason the
 * app exists, Progress is the glance back at it, Nutrition is what you read
 * after training, and everything else is a reference page reached from More.
 */
export const navigationItems: NavItem[] = [
  { id: 'today-workout', icon: Dumbbell, label: "Today's Workout", shortLabel: 'Workout' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
  { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
  { id: 'more', icon: MoreHorizontal, label: 'More' },
]

/** Pages listed on the More screen, in the order they appear. */
export const moreNavigationItems: NavItem[] = [
  {
    id: 'weekly-plan',
    icon: CalendarDays,
    label: 'Weekly Plan',
    description: 'The seven training days and what each one covers.',
  },
  {
    id: 'exercise-library',
    icon: Library,
    label: 'Exercise Library',
    description: 'Form guides, demo videos and muscle groups.',
  },
  {
    id: 'weekly-review',
    icon: ClipboardCheck,
    label: 'Weekly Review',
    description: 'How last week went and what to focus on next.',
  },
  {
    id: 'body-check-in',
    icon: NotebookPen,
    label: 'Body Check-in',
    description: 'Weight, measurements and progress photos.',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    description: 'Profile, program, reminders, backup and sync.',
  },
]
