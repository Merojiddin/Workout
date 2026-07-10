interface ProgressBarProps {
  label: string
  max: number
  value: number
}

export function ProgressBar({ label, max, value }: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className="progress-block">
      <div className="progress-block__header">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div
        className="progress-track"
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        role="progressbar"
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
