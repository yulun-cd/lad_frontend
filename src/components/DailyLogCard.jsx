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
        <button
          onClick={onEdit}
          className="secondary icon-button"
          aria-label="Edit daily log"
          title="Edit daily log"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="secondary danger icon-button"
          aria-label="Delete daily log"
          title="Delete daily log"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default DailyLogCard

