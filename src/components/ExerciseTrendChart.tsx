interface ExerciseTrendChartProps {
  points: { date: string; value: number }[]
  unit: string
}

const WIDTH = 320
const HEIGHT = 120
const PAD_X = 12
const PAD_TOP = 12
const PAD_BOTTOM = 26

/**
 * The per-exercise trend, as plain inline SVG.
 *
 * Deliberately not recharts: that library is the single biggest dependency in
 * the app and is code-split behind Body Check-in. Pulling it into the exercise
 * detail sheet would drag it into the live-workout path for one small line.
 */
export function ExerciseTrendChart({ points, unit }: ExerciseTrendChartProps) {
  if (points.length < 2) {
    return null
  }

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // A flat series would divide by zero; draw it down the middle instead.
  const span = max - min || Math.max(1, max || 1)
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
  const stepX =
    points.length > 1 ? (WIDTH - PAD_X * 2) / (points.length - 1) : 0

  const coords = points.map((point, index) => ({
    x: PAD_X + index * stepX,
    y: PAD_TOP + plotHeight - ((point.value - min) / span) * plotHeight,
    point,
  }))
  const last = coords[coords.length - 1]

  return (
    <figure className="detail-chart">
      <svg
        aria-label={`${points.length} sessions, from ${min} to ${max} ${unit}`}
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        {[0, 0.5, 1].map((fraction) => (
          <line
            className="detail-chart__grid"
            key={fraction}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={PAD_TOP + plotHeight * fraction}
            y2={PAD_TOP + plotHeight * fraction}
          />
        ))}

        <polyline
          className="detail-chart__line"
          points={coords.map(({ x, y }) => `${x},${y}`).join(' ')}
        />

        {coords.map(({ x, y, point }) => (
          <circle className="detail-chart__dot" cx={x} cy={y} key={point.date} r={3} />
        ))}
        <circle className="detail-chart__dot" cx={last.x} cy={last.y} r={5} />

        <text className="detail-chart__label" x={PAD_X} y={HEIGHT - 6}>
          {shortDate(points[0].date)}
        </text>
        <text
          className="detail-chart__label"
          textAnchor="end"
          x={WIDTH - PAD_X}
          y={HEIGHT - 6}
        >
          {shortDate(points[points.length - 1].date)}
        </text>
      </svg>
    </figure>
  )
}

function shortDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  return parsed.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
}
