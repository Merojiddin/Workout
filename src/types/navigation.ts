import type { LucideIcon } from 'lucide-react'
import type { MessageKey } from '../i18n'

export type PageId =
  | 'today-workout'
  | 'progress'
  | 'nutrition'
  | 'more'
  | 'profile'
  | 'guided-workouts'
  | 'weekly-plan'
  | 'body-check-in'
  | 'exercise-library'
  | 'weekly-review'
  | 'settings'
  | 'privacy'
  | 'disclaimer'
  | 'pre-deploy-checklist'

/**
 * Nav entries carry message keys rather than finished text: the list is built
 * once at module load, long before a language is chosen, and has to re-read in
 * whatever language is active when a nav renders.
 */
export interface NavItem {
  id: PageId
  icon: LucideIcon
  labelKey: MessageKey
  shortLabelKey?: MessageKey
  descriptionKey?: MessageKey
}
