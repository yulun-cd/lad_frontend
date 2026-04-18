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
  const cx = 160
  const cy = 160
  const r = 130
  const total = data.reduce((sum, d) => sum + d.count, 0)

  const slices = []
  let startAngle = -Math.PI / 2
  data.forEach((d) => {
    const section = COMPLETION_SECTIONS.find((s) => s.key === d.section)
    const angle = (d.count / total) * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const midAngle = startAngle + angle / 2
    const labelR = r * 0.65
    const lx = cx + labelR * Math.cos(midAngle)
    const ly = cy + labelR * Math.sin(midAngle)
    slices.push({ ...d, section, x1, y1, x2, y2, largeArc, lx, ly, angle })
    startAngle = endAngle
  })

  return (
    <div className="viz-chart-shell viz-pie-shell">
      <svg
        viewBox="0 0 320 320"
        className="viz-pie-chart"
        role="img"
        aria-label="Task completion time of day pie chart"
      >
        {slices.map((s) => (
          <g key={s.key}>
            <path
              d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`}
              fill={s.section?.color ?? '#2563eb'}
              opacity="0.88"
              stroke="var(--card-bg)"
              strokeWidth="2"
            >
              <title>{`${s.section?.label}: ${s.count} task${s.count !== 1 ? 's' : ''}`}</title>
            </path>
            {s.angle > 0.25 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" className="viz-pie-label">
                {s.count}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="viz-pie-legend">
        {data.map((d) => {
          const section = COMPLETION_SECTIONS.find((s) => s.key === d.section)
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
          return (
            <div key={d.section} className="viz-pie-legend-item">
              <span className="viz-bar-axis-dot" style={{ background: section?.color }} />
              <span className="viz-pie-legend-label">{section?.label}</span>
              <span className="viz-pie-legend-count">{d.count} ({pct}%)</span>
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
