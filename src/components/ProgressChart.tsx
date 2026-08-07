import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ProgressChartProps {
  badges?: string[]
  data: object[]
  description?: string
  dataKey: string
  emptyMessage: string
  maxValue?: number
  title: string
  valueLabel: string
  variant?: 'bar' | 'line'
  xKey?: string
}

export function ProgressChart({
  badges = [],
  data,
  dataKey,
  description,
  emptyMessage,
  maxValue,
  title,
  valueLabel,
  variant = 'line',
  xKey = 'date',
}: ProgressChartProps) {
  const hasData = data.some((item) => Number(getChartValue(item, dataKey)) > 0)

  return (
    <article className="progress-chart-card">
      <div>
        <p className="eyebrow">{valueLabel}</p>
        <h2>{title}</h2>
        {badges.length > 0 ? (
          <div className="tag-row">
            {badges.map((badge) => (
              <span className="tag tag--category" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        {description ? <p>{description}</p> : null}
      </div>

      {hasData ? (
        <div className="chart-frame">
          <ResponsiveContainer height={230} width="100%">
            {variant === 'bar' ? (
              <BarChart data={data} margin={{ bottom: 0, left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey={xKey}
                  tick={{ fill: '#98a7a3', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  domain={maxValue ? [0, maxValue] : undefined}
                  tick={{ fill: '#98a7a3', fontSize: 12 }}
                  tickLine={false}
                  ticks={maxValue === 1 ? [0, 1] : undefined}
                />
                <Tooltip
                  contentStyle={{
                    background: '#10151b',
                    border: '1px solid #24313c',
                    borderRadius: 8,
                    color: '#edf4f1',
                  }}
                  formatter={(value) => [`${value}`, valueLabel]}
                />
                <Bar dataKey={dataKey} fill="#32d583" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ bottom: 0, left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey={xKey}
                  tick={{ fill: '#98a7a3', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  domain={maxValue ? [0, maxValue] : undefined}
                  tick={{ fill: '#98a7a3', fontSize: 12 }}
                  tickLine={false}
                  ticks={maxValue === 1 ? [0, 1] : undefined}
                />
                <Tooltip
                  contentStyle={{
                    background: '#10151b',
                    border: '1px solid #24313c',
                    borderRadius: 8,
                    color: '#edf4f1',
                  }}
                  formatter={(value, _, props) => [
                    props.payload?.label ?? `${value}`,
                    valueLabel,
                  ]}
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
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty-state">{emptyMessage}</div>
      )}
    </article>
  )
}

function getChartValue(item: object, key: string) {
  return (item as Record<string, unknown>)[key]
}
