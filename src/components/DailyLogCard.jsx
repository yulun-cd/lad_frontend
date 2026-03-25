import { format } from 'date-fns'
import '../styles/daily-log-card.css'

function DailyLogCard({ log, onEdit, onDelete }) {
  const formattedDate = format(new Date(log.date), 'EEEE, MMMM dd, yyyy')
  const displayTimestamp = log.updated_at || log.created_at
  const formattedTimestamp = displayTimestamp
    ? format(new Date(displayTimestamp), 'MMM dd, yyyy HH:mm')
    : null

  const getOverallClass = (value) => {
    if (value >= 4) return 'overall-good'
    if (value <= 2) return 'overall-poor'
    return 'overall-neutral'
  }

  return (
    <div className="daily-log-card">
      <div className="log-header">
        <div>
          <h3 className="log-date">{formattedDate}</h3>
          {formattedTimestamp && (
            <p className="log-timestamp">Last changed: {formattedTimestamp}</p>
          )}
        </div>
        <span className={`overall-badge ${getOverallClass(log.overall)}`}>
          Overall: {log.overall}/5
        </span>
      </div>

      <div className="log-ratings">
        <div className="rating-item">
          <span className="rating-label">Energy</span>
          <span className="rating-value">{log.energy}/5</span>
        </div>
        <div className="rating-item">
          <span className="rating-label">Emotion</span>
          <span className="rating-value">{log.emotion}/5</span>
        </div>
        <div className="rating-item">
          <span className="rating-label">Productivity</span>
          <span className="rating-value">{log.productivity}/5</span>
        </div>
      </div>

      {log.description && (
        <div className="log-notes">
          <p>{log.description}</p>
        </div>
      )}

      <div className="log-actions">
        <button onClick={onEdit} className="secondary">
          Edit
        </button>
        <button onClick={onDelete} className="secondary danger">
          Delete
        </button>
      </div>
    </div>
  )
}

export default DailyLogCard

