import { format } from 'date-fns'
import '../styles/task-card.css'

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const displayTimestamp = task.updated_at || task.created_at
  const formattedTimestamp = displayTimestamp
    ? format(new Date(displayTimestamp), 'MMM dd, yyyy HH:mm')
    : null

  const getEnergyClass = (energyLevel) => {
    if (energyLevel >= 4) return 'energy-high'
    if (energyLevel <= 2) return 'energy-low'
    return 'energy-medium'
  }

  const getStatusClass = (status) => {
    return `status-${String(status).toLowerCase()}`
  }

  const getStatusDisplay = (status) => {
    const display = {
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
    }
    return display[status] || String(status).replace('_', ' ')
  }

  return (
    <div className="task-card">
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
          {formattedTimestamp && (
            <p className="task-timestamp">Last changed: {formattedTimestamp}</p>
          )}
        </div>
        <div className="task-badges">
          <span className={`energy-badge ${getEnergyClass(task.energy_level)}`}>
            Energy: {task.energy_level}/5
          </span>
          <span className={`status-badge ${getStatusClass(task.status)}`}>
            {getStatusDisplay(task.status)}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
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

export default TaskCard
