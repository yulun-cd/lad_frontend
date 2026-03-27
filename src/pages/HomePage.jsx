import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { dailySummaryService } from '../services/dailySummary'
import '../styles/home.css'

const firstDefined = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key]
    }
  }
  return fallback
}

const normalizeLog = (log) => {
  if (!log || typeof log !== 'object') return null

  const normalized = {
    date: firstDefined(log, ['date', 'day']),
    overall: firstDefined(log, ['overall', 'overall_score']),
    energy: firstDefined(log, ['energy', 'energy_score']),
    emotion: firstDefined(log, ['emotion', 'emotion_score']),
    productivity: firstDefined(log, ['productivity', 'productivity_score']),
    description: firstDefined(log, ['description', 'notes', 'note'], ''),
  }

  if (!normalized.date && normalized.overall == null && !normalized.description) {
    return null
  }

  return normalized
}

const extractSummary = (raw) => {
  const container = firstDefined(raw, ['data', 'summary'], raw)
  const nestedLogs = firstDefined(container, ['daily_logs', 'logs'], {}) || {}

  const completedToday = Number(
    firstDefined(container, [
      'tasks_completed_today',
      'completed_tasks_today',
      'num_tasks_completed_today',
      'completed_today',
    ], 0)
  )

  const todayCandidate = firstDefined(container, [
    'today_log',
    'today_daily_log',
    'daily_log_today',
    'today',
  ], firstDefined(nestedLogs, ['today'], null))

  const yesterdayCandidate = firstDefined(container, [
    'yesterday_log',
    'yesterday_daily_log',
    'daily_log_yesterday',
    'yesterday',
  ], firstDefined(nestedLogs, ['yesterday'], null))

  return {
    tasksCompletedToday: Number.isFinite(completedToday) ? completedToday : 0,
    todayLog: normalizeLog(todayCandidate),
    yesterdayLog: normalizeLog(yesterdayCandidate),
  }
}

function HomePage() {
  const { isAuthenticated } = useAuth()
  const [summary, setSummary] = useState({
    tasksCompletedToday: 0,
    todayLog: null,
    yesterdayLog: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const canShowSummary = useMemo(() => isAuthenticated, [isAuthenticated])

  const fetchSummary = async () => {
    if (!canShowSummary) return

    setIsLoading(true)
    setError(null)
    try {
      const raw = await dailySummaryService.getDailySummary()
      setSummary(extractSummary(raw))
      setLastUpdated(new Date())
    } catch (err) {
      setError('Could not load daily summary right now.')
      console.error('Error loading daily summary:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [canShowSummary])

  const renderLogCard = (title, log) => (
    <article className="summary-log-card">
      <div className="summary-log-header">
        <h3>{title}</h3>
        {log?.date ? <span>{format(new Date(log.date), 'MMM dd, yyyy')}</span> : null}
      </div>

      {log ? (
        <>
          <div className="summary-metrics">
            <p><strong>Overall:</strong> {log.overall ?? 'N/A'}</p>
            <p><strong>Energy:</strong> {log.energy ?? 'N/A'}</p>
            <p><strong>Emotion:</strong> {log.emotion ?? 'N/A'}</p>
            <p><strong>Productivity:</strong> {log.productivity ?? 'N/A'}</p>
          </div>
          <p className="summary-log-description">{log.description || 'No notes provided.'}</p>
        </>
      ) : (
        <p className="summary-empty">No daily log found.</p>
      )}
    </article>
  )

  return (
    <div className="home-page">
      <section className="summary-hero">
        <h1>Daily Summary</h1>
        <p>A quick snapshot of progress and well-being.</p>
        {lastUpdated ? (
          <small>Last updated: {format(lastUpdated, 'HH:mm:ss')}</small>
        ) : null}
      </section>

      {!canShowSummary ? (
        <section className="summary-guest-card">
          <h2>Welcome</h2>
          <p>Log in to view your daily summary dashboard.</p>
          <div className="summary-links">
            <Link to="/login" className="primary-link">Login</Link>
            <Link to="/register" className="secondary-link">Register</Link>
          </div>
        </section>
      ) : (
        <>
          <section className="summary-top-row">
            <article className="summary-stat-card">
              <p className="summary-stat-label">Tasks Completed Today</p>
              <p className="summary-stat-value">{summary.tasksCompletedToday}</p>
            </article>

            <button className="secondary summary-refresh" onClick={fetchSummary} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </section>

          {error ? <div className="summary-error">{error}</div> : null}

          <section className="summary-logs-grid">
            {renderLogCard("Today's Log", summary.todayLog)}
            {renderLogCard("Yesterday's Log", summary.yesterdayLog)}
          </section>

          <section className="summary-footer-links">
            <Link to="/tasks" className="secondary-link">Go to Tasks</Link>
            <Link to="/daily-logs" className="secondary-link">Go to Daily Logs</Link>
          </section>
        </>
      )}
    </div>
  )
}

export default HomePage
