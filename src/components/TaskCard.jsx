import { useRef, useState } from 'react'
import { format } from 'date-fns'
import TagPicker from './TagPicker'
import '../styles/task-card.css'
import '../styles/tags.css'

function TaskCard({ task, onEdit, onDelete, showCompleteCheckbox = false, onMarkCompleted, tags = [], onTagChange, onTagsChange }) {
  const handleCardClick = (e) => {
    if (onEdit) onEdit()
  }

  const displayTimestamp = task.updated_at || task.created_at
  const formattedTimestamp = displayTimestamp
    ? format(new Date(displayTimestamp), 'MMM dd, yyyy HH:mm')
    : null

  const getEnergyClass = (energyLevel) => {
    const normalized = Math.min(5, Math.max(1, Number(energyLevel) || 3))
    return `energy-${normalized}`
  }

  return (
    <div className="task-card task-card--clickable" onClick={handleCardClick}>
      <div className="task-layout">
        {showCompleteCheckbox && (
          <div className="task-complete-slot" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="task-complete-checkbox"
              aria-label="Mark task as completed"
              onChange={(e) => {
                if (e.target.checked && onMarkCompleted) {
                  onMarkCompleted()
                }
              }}
            />
          </div>
        )}

        <div className="task-content">
          <div className="task-header">
            <div className="task-main">
              <h3 className="task-title">{task.title}</h3>
              {task.description && <p className="task-description">{task.description}</p>}
              {task.date && (
                <p className="task-due-date">Due: {format(new Date(task.date), 'MMM dd, yyyy')}</p>
              )}
              {task.recurrence_interval && (
                <p className="task-recurring-badge">↻ Every {task.recurrence_interval} day{task.recurrence_interval !== 1 ? 's' : ''}</p>
              )}
              {task.recurrence_origin && (
                <p className="task-spawned-badge">↳ Recurring task</p>
              )}
              {formattedTimestamp && (
                <p className="task-timestamp">Last changed: {formattedTimestamp}</p>
              )}
            </div>
            <div className="task-side">
              <div className="task-badges">
                <span className={`energy-badge ${getEnergyClass(task.energy_level)}`}>
                  Energy: {task.energy_level}/5
                </span>
                {onTagChange && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TagPicker
                      tags={tags}
                      value={task.tag}
                      onChange={(tagId) => onTagChange(task.id, tagId)}
                      onTagsChange={onTagsChange}
                    />
                  </div>
                )}
              </div>

              <div className="task-actions">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete && onDelete() }}
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
      </div>
    </div>
  )
}

export default TaskCard
