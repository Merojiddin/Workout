import type { LucideIcon } from 'lucide-react'

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
}: QuickActionButtonProps) {
  return (
    <button
      className={`quick-action quick-action--${variant}`}
      onClick={onClick}
      type="button"
    >
      <Icon size={19} strokeWidth={2.4} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
