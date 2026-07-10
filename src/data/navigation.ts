import {
  BarChart3,
  Brain,
  CalendarDays,
  ClipboardCheck,
  Database,
  FileDown,
  Dumbbell,
  Home,
  Library,
  ListChecks,
  MoreHorizontal,
  NotebookPen,
  Settings,
  Utensils,
} from 'lucide-react'
import type { NavItem } from '../types/navigation'

export const navigationItems: NavItem[] = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'today-workout', icon: Dumbbell, label: "Today's Workout" },
  { id: 'weekly-plan', icon: CalendarDays, label: 'Weekly Plan' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
  { id: 'body-check-in', icon: NotebookPen, label: 'Body Check-in' },
  { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
  { id: 'exercise-library', icon: Library, label: 'Exercise Library' },
  { id: 'weekly-review', icon: ClipboardCheck, label: 'Weekly Review' },
  { id: 'plan-editor', icon: ListChecks, label: 'Plan Editor' },
  { id: 'export-print', icon: FileDown, label: 'Export / Print' },
  { id: 'coach', icon: Brain, label: 'Coach' },
  { id: 'data-health', icon: Database, label: 'Data Health' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export const mobileNavigationItems: NavItem[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'today-workout', icon: Dumbbell, label: 'Workout' },
  { id: 'coach', icon: Brain, label: 'Coach' },
  { id: 'progress', icon: BarChart3, label: 'Progress' },
  { id: 'settings', icon: MoreHorizontal, label: 'More' },
]
