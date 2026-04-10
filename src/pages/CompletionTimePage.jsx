import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tasksService } from '../services/tasks'
import '../styles/visualization.css'

const COMPLETION_SECTIONS = [
  { key: 'morning',   label: '08:00–12:00', color: '#f59e0b' },
  { key: 'afternoon', label: '12:00–17:00', color: '#2563eb' },
  { key: 'evening',   label: '17:00–21:00', color: '#ec4899' },
  { key: 'night',     label: '21:00–08:00', color: '#6366f1' },
]

function CompletionTimeChart({ data }) {
  const width = 560
  const height = 260
  const padding = { top: 24, right: 24, bottom: 52, left: 40 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const maxCount = Math.max(...data.map((d) => d.count), 4)
  const slotWidth = innerWidth / data.length
  const barWidth = slotWidth * 0.55

  const xCenter = (i) => padding.left + slotWidth * i + slotWidth / 2
  const yForCount = (count) => padding.top + innerHeight - (count / maxCount) * innerHeight

  const yTicks = Array.from({ length: maxCount + 1 }, (_, i) => i).filter(
    (v) => v === 0 || v === maxCount || (maxCount <= 10 ? true : v % Math.ceil(maxCount / 5) === 0)
  )

  return (
    <div className="viz-chart-shell">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="viz-bar-chart"
        role="img"
        aria-label="Task completion time of day chart"
      >
        {yTicks.map((tick) => {
          const y = yForCount(tick)
          return (
            <g key={`ytick-${tick}`}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="viz-grid-line" />
              <text x={padding.left - 6} y={y + 4} className="viz-axis-label" textAnchor="end">{tick}</text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const section = COMPLETION_SECTIONS.find((s) => s.key === d.section)
          const x = xCenter(i) - barWidth / 2
          const barH = (d.count / maxCount) * innerHeight
          const y = yForCount(d.count)
          return (
            <g key={d.section}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={section?.color ?? '#2563eb'}
                rx="4"
                opacity="0.88"
              >
                <title>{`${section?.label}: ${d.count} task${d.count !== 1 ? 's' : ''}`}</title>
              </rect>
              {d.count > 0 && (
                <text
                  x={xCenter(i)}
                  y={y - 6}
                  className="viz-bar-value"
                  textAnchor="middle"
                >
                  {d.count}
                </text>
              )}
            </g>
          )
        })}

        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={width - padding.right}
          y2={padding.top + innerHeight}
          className="viz-grid-line"
        />
      </svg>

      <div className="viz-bar-axis">
        {data.map((d) => {
          const section = COMPLETION_SECTIONS.find((s) => s.key === d.section)
          return (
            <div key={d.section} className="viz-bar-axis-label">
              <span className="viz-bar-axis-dot" style={{ background: section?.color }} />
              {section?.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompletionTimePage() {
  const [completionData, setCompletionData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    tasksService.getCompletionTime()
      .then((data) => { if (!cancelled) setCompletionData(data) })
      .catch(() => { if (!cancelled) setError('Could not load task completion data.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="visualization-page">
      <section className="viz-toolbar">
        <div>
          <Link to="/visualizations" className="viz-back-link">← Visualizations</Link>
          <h1>Task Completion by Time of Day</h1>
          <p>Aggregated count of completed tasks per time block.</p>
        </div>
      </section>

      <section className="viz-panel">
        <div className="viz-panel-header">
          <h2>Completion Time Distribution</h2>
          <span>When during the day you tend to finish tasks</span>
        </div>

        {error && <div className="viz-error">{error}</div>}

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : completionData.every((d) => d.count === 0) ? (
          <p className="viz-empty">No completed tasks recorded yet.</p>
        ) : (
          <CompletionTimeChart data={completionData} />
        )}
      </section>
    </div>
  )
}

export default CompletionTimePage
