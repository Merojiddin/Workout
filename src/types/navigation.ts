import type { LucideIcon } from 'lucide-react'

export type PageId =
  | 'dashboard'
  | 'today-workout'
  | 'weekly-plan'
  | 'progress'
  | 'body-check-in'
  | 'nutrition'
  | 'exercise-library'
  | 'weekly-review'
  | 'plan-editor'
  | 'coach'
  | 'data-health'
  | 'settings'
  | 'export-print'
  | 'privacy'
  | 'disclaimer'
  | 'pre-deploy-checklist'

export interface NavItem {
  id: PageId
  icon: LucideIcon
  label: string
  shortLabel?: string
}
