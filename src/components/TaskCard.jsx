import { format } from 'date-fns'
import '../styles/task-card.css'

function TaskCard({ task, onEdit, onDelete }) {
  const displayTimestamp = task.updated_at || task.created_at
  const formattedTimestamp = displayTimestamp
    ? format(new Date(displayTimestamp), 'MMM dd, yyyy HH:mm')
    : null

  const getEnergyClass = (energyLevel) => {
    if (energyLevel >= 4) return 'energy-high'
    if (energyLevel <= 2) return 'energy-low'
    return 'energy-medium'
  }

  return (
    <div className="task-card">
      <div className="task-header">
        <div className="task-main">
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
          {formattedTimestamp && (
            <p className="task-timestamp">Last changed: {formattedTimestamp}</p>
          )}
        </div>
        <div className="task-side">
          <div className="task-badges">
            <span className={`energy-badge ${getEnergyClass(task.energy_level)}`}>
              Energy: {task.energy_level}/5
            </span>
          </div>

          <div className="task-actions">
            <button
              onClick={onEdit}
              className="secondary icon-button"
              aria-label="Edit task"
              title="Edit task"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="secondary danger icon-button"
              aria-label="Delete task"
              title="Delete task"
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
      </div>
    </div>
  )
}

export default TaskCard
