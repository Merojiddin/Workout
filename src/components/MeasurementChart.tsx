import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MeasurementPoint } from '../utils/bodyCheckInUtils'

interface MeasurementChartProps {
  data: MeasurementPoint[]
  dataKey: string
  emptyMessage: string
  title: string
  unit: string
}

export function MeasurementChart({
  data,
  dataKey,
  emptyMessage,
  title,
  unit,
}: MeasurementChartProps) {
  const hasData = Array.isArray(data) && data.length > 0

  return (
    <article className="progress-chart-card">
      <div>
        <p className="eyebrow">{unit ? `Progress · ${unit}` : 'Progress'}</p>
        <h2>{title}</h2>
      </div>

      {hasData ? (
        <div className="chart-frame">
          <ResponsiveContainer height={230} width="100%">
            <LineChart data={data} margin={{ bottom: 0, left: -12, right: 8, top: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                tick={{ fill: '#98a7a3', fontSize: 12 }}
                tickFormatter={formatAxisDate}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={['auto', 'auto']}
                tick={{ fill: '#98a7a3', fontSize: 12 }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: '#10151b',
                  border: '1px solid #24313c',
                  borderRadius: 8,
                  color: '#edf4f1',
                }}
                formatter={(value) => [
                  unit ? `${value} ${unit}` : `${value}`,
                  title,
                ]}
                labelFormatter={formatAxisDate}
              />
              <Line
                activeDot={{ fill: '#32d583', r: 6, stroke: '#edf4f1' }}
                dataKey={dataKey}
                dot={{ fill: '#5da8ff', r: 4, strokeWidth: 0 }}
                stroke="#32d583"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty-state">{emptyMessage}</div>
      )}
    </article>
  )
}

function formatAxisDate(value: unknown): string {
  const parsed = new Date(`${String(value)}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}
