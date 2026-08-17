import type { LucideIcon } from 'lucide-react'

export type PageId =
  | 'today-workout'
  | 'nutrition'
  | 'more'
  | 'weekly-plan'
  | 'body-check-in'
  | 'exercise-library'
  | 'weekly-review'
  | 'settings'
  | 'privacy'
  | 'disclaimer'
  | 'pre-deploy-checklist'

export interface NavItem {
  id: PageId
  icon: LucideIcon
  label: string
  shortLabel?: string
  description?: string
}
