import type { ReactNode } from 'react'

export type TagVariant =
  | 'neutral'
  | 'muscle'
  | 'secondary-muscle'
  | 'equipment'
  | 'category'
  | 'difficulty-beginner'
  | 'difficulty-intermediate'
  | 'difficulty-advanced'
  | 'posture'

interface TagProps {
  children: ReactNode
  variant?: TagVariant
}

export function Tag({ children, variant = 'neutral' }: TagProps) {
  return <span className={`tag tag--${variant}`}>{children}</span>
}
