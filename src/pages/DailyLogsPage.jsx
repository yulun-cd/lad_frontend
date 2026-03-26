import { useState, useEffect } from 'react'
import { dailyLogsService } from '../services/dailyLogs'
import DailyLogCard from '../components/DailyLogCard'
import DailyLogForm from '../components/DailyLogForm'
import '../styles/daily-logs.css'

function DailyLogsPage() {
  const [dailyLogs, setDailyLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  useEffect(() => {
    fetchDailyLogs()
  }, [])

  useEffect(() => {
    const resetDailyLogsView = () => {
      setShowForm(false)
      setEditingLog(null)
      setError(null)
    }

    window.addEventListener('daily-logs:reset-view', resetDailyLogsView)
    return () => {
      window.removeEventListener('daily-logs:reset-view', resetDailyLogsView)
    }
  }, [])

  const fetchDailyLogs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await dailyLogsService.getDailyLogs()
      setDailyLogs(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Failed to load daily logs. Please try again.')
      console.error('Error fetching daily logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLog = async (logData) => {
    try {
      await dailyLogsService.createDailyLog(logData)
      await fetchDailyLogs()
      setShowForm(false)
    } catch (err) {
      setError('Failed to create daily log. Please try again.')
      console.error('Error creating log:', err)
    }
  }

  const handleUpdateLog = async (id, logData) => {
    try {
      await dailyLogsService.updateDailyLog(id, logData)
      await fetchDailyLogs()
      setEditingLog(null)
    } catch (err) {
      setError('Failed to update daily log. Please try again.')
      console.error('Error updating log:', err)
    }
  }

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily log?')) {
      return
    }
    try {
      await dailyLogsService.deleteDailyLog(id)
      await fetchDailyLogs()
    } catch (err) {
      setError('Failed to delete daily log. Please try again.')
      console.error('Error deleting log:', err)
    }
  }

  const sortedLogs = [...dailyLogs].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  if (isLoading && dailyLogs.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading daily logs...</p>
      </div>
    )
  }

  return (
    <div className="daily-logs-page">
      <div className="logs-header">
        <h1>Daily Logs</h1>
        <button
          className="primary"
          onClick={() => {
            setEditingLog(null)
            setShowForm(!showForm)
          }}
        >
          {showForm ? 'Close' : '+ Add Log'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <DailyLogForm
          existingLogDates={dailyLogs.map((entry) => entry.date)}
          onSubmit={handleAddLog}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLog && (
        <DailyLogForm
          log={editingLog}
          existingLogDates={dailyLogs.map((entry) => entry.date)}
          onSubmit={(data) => handleUpdateLog(editingLog.id, data)}
          onCancel={() => setEditingLog(null)}
        />
      )}

      <div className="logs-list">
        {sortedLogs.length === 0 ? (
          <p className="empty-message">
            No daily logs yet. Create one to get started!
          </p>
        ) : (
          sortedLogs.map((log) => (
            <DailyLogCard
              key={log.id}
              log={log}
              onEdit={() => setEditingLog(log)}
              onDelete={() => handleDeleteLog(log.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DailyLogsPage
