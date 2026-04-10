import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { dailyLogsService } from '../services/dailyLogs'
import '../styles/visualization.css'

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '15', label: 'Last 15 days' },
  { value: '30', label: 'Last month' },
]

const METRIC_META = {
  overall: { label: 'Overall', color: '#2563eb', dash: '0' },
  energy: { label: 'Energy', color: '#f59e0b', dash: '8 6' },
  emotion: { label: 'Emotion', color: '#ec4899', dash: '4 5' },
  productivity: { label: 'Productivity', color: '#10b981', dash: '12 7' },
}

const METRIC_KEYS = Object.keys(METRIC_META)

const buildOverlapOffsets = (rows) => {
  return rows.map((row) => {
    if (!row.metrics) return { ...row, offsets: {} }

    const valueGroups = new Map()
    METRIC_KEYS.forEach((metricKey) => {
      const value = Number(row.metrics[metricKey]) || 0
      if (!value) return

      if (!valueGroups.has(value)) valueGroups.set(value, [])
      valueGroups.get(value).push(metricKey)
    })

    const offsets = {}
    valueGroups.forEach((group) => {
      if (group.length === 1) {
        offsets[group[0]] = 0
        return
      }

      const ordered = [...group].sort((a, b) => METRIC_KEYS.indexOf(a) - METRIC_KEYS.indexOf(b))
      const center = (ordered.length - 1) / 2
      const spacing = 2.8

      ordered.forEach((metricKey, index) => {
        offsets[metricKey] = (index - center) * spacing
      })
    })

    return { ...row, offsets }
  })
}

const toDateKey = (date) => format(date, 'yyyy-MM-dd')

const buildDateRange = (days) => {
  const end = new Date()
  const start = subDays(end, days - 1)
  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  }
}

const createDisplayRows = (days, points) => {
  const { startDate } = buildDateRange(days)
  const start = new Date(startDate)
  const todayKey = toDateKey(new Date())

  const byDate = new Map(
    points.map((point) => [
      point.date,
      {
        overall: Number(point.overall) || 0,
        energy: Number(point.energy) || 0,
        emotion: Number(point.emotion) || 0,
        productivity: Number(point.productivity) || 0,
      },
    ]),
  )

  return Array.from({ length: days }, (_, index) => {
    const date = subDays(start, -index)
    const key = toDateKey(date)
    const metrics = byDate.get(key)

    return {
      key,
      label: format(date, 'MMM dd'),
      date,
      metrics: metrics || null,
      isToday: key === todayKey,
    }
  })
}

function EnergyOverTimeChart({ rows }) {
  const width = 760
  const height = 300
  const padding = { top: 24, right: 24, bottom: 38, left: 30 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const xForIndex = (index) => {
    if (rows.length === 1) return padding.left + innerWidth / 2
    return padding.left + (index * innerWidth) / (rows.length - 1)
  }

  const yForValue = (value) => {
    const clamped = Math.max(1, Math.min(5, value))
    const ratio = (clamped - 1) / 4
    return padding.top + innerHeight - ratio * innerHeight
  }

  const adjustedRows = useMemo(() => buildOverlapOffsets(rows), [rows])

  const yWithOffset = (value, offset = 0) => {
    const y = yForValue(value) + offset
    return Math.max(padding.top, Math.min(padding.top + innerHeight, y))
  }

  const buildSegments = (metricKey) => {
    const segments = []
    let current = []

    adjustedRows.forEach((row, index) => {
      const value = row.metrics ? Number(row.metrics[metricKey]) : null
      if (!value) {
        if (current.length) segments.push(current)
        current = []
        return
      }

      current.push({
        x: xForIndex(index),
        y: yWithOffset(value, row.offsets?.[metricKey] || 0),
        value,
        label: row.label,
      })
    })

    if (current.length) segments.push(current)
    return segments
  }

  return (
    <div className="viz-chart-shell">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="viz-line-chart"
        role="img"
        aria-label="Daily logs energy over time chart"
      >
        {[1, 2, 3, 4, 5].map((tick) => {
          const y = yForValue(tick)
          return (
            <g key={`tick-${tick}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="viz-grid-line"
              />
              <text x={8} y={y + 4} className="viz-axis-label">
                {tick}
              </text>
            </g>
          )
        })}

        {Object.entries(METRIC_META).map(([metricKey, metric]) => {
          const segments = buildSegments(metricKey)
          return (
            <g key={metricKey}>
              {segments.map((segment, idx) => (
                <path
                  key={`${metricKey}-segment-${idx}`}
                  d={segment
                    .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                    .join(' ')}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="2.8"
                  strokeDasharray={metric.dash}
                  opacity="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {adjustedRows.map((row, index) => {
                if (!row.metrics) return null
                const value = Number(row.metrics[metricKey])
                if (!value) return null

                const x = xForIndex(index)
                const y = yWithOffset(value, row.offsets?.[metricKey] || 0)

                return (
                  <circle
                    key={`${metricKey}-${row.key}`}
                    cx={x}
                    cy={y}
                    r="3.8"
                    fill={metric.color}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                  >
                    <title>{`${metric.label}: ${value} on ${row.label}`}</title>
                  </circle>
                )
              })}
            </g>
          )
        })}
      </svg>

      <div
        className="viz-axis-dates"
        style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}
      >
        {rows.map((row) => (
          <span
            key={row.key}
            className={row.isToday ? 'viz-axis-date viz-axis-date--today' : 'viz-axis-date'}
            title={row.isToday ? 'Today' : undefined}
          >
            {row.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function EnergyOverTimePage() {
  const [rangeDays, setRangeDays] = useState('7')
  const [points, setPoints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      const days = Number(rangeDays)
      const { startDate, endDate } = buildDateRange(days)

      try {
        const data = await dailyLogsService.getEnergyOverTime({ startDate, endDate })
        if (!cancelled) {
          setPoints(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load energy trend data right now.')
          setPoints([])
        }
        console.error('Error loading energy-over-time data:', err)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [rangeDays])

  const rows = useMemo(() => createDisplayRows(Number(rangeDays), points), [rangeDays, points])
  const hasAnyData = rows.some((row) => row.metrics)

  return (
    <div className="visualization-page">
      <section className="viz-toolbar">
        <div>
          <Link to="/visualizations" className="viz-back-link">← Visualizations</Link>
          <h1>Energy Over Time</h1>
          <p>Track changes in overall, energy, emotion, and productivity scores over time.</p>
        </div>

        <label className="viz-range-picker" htmlFor="viz-range">
          <span>Period</span>
          <select
            id="viz-range"
            value={rangeDays}
            onChange={(event) => setRangeDays(event.target.value)}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? <div className="viz-error">{error}</div> : null}

      <section className="viz-panel">
        <div className="viz-panel-header">
          <h2>Energy Trends</h2>
          <span>Blank gaps represent days without a log</span>
        </div>

        <div className="viz-legend">
          {Object.entries(METRIC_META).map(([key, meta]) => (
            <div key={key} className="viz-legend-item">
              <span className="viz-status-dot" style={{ backgroundColor: meta.color }}></span>
              <span>{meta.label}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : hasAnyData ? (
          <EnergyOverTimeChart rows={rows} />
        ) : (
          <p className="viz-empty">No logs found for the selected period.</p>
        )}
      </section>
    </div>
  )
}

export default EnergyOverTimePage
