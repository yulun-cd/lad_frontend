import { useState, useEffect } from 'react'
import TagPicker from './TagPicker'
import '../styles/task-form.css'

function TaskForm({ task, onSubmit, onCancel, initialStatus = 'PENDING', showStatusField = true, tags = [], onTagsChange }) {
  const normalizedInitialStatus = String(initialStatus || 'PENDING').toUpperCase()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    recurrence_interval: '',
    status: normalizedInitialStatus,
    energy_level: 3,
    tag: null,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData(task)
      return
    }

    setFormData((prev) => ({
      ...prev,
      status: normalizedInitialStatus,
      tag: null,
    }))
  }, [task, normalizedInitialStatus])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (formData.recurrence_interval && !formData.date) {
      newErrors.date = 'Due date is required for recurring tasks'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        date: formData.date || null,
        recurrence_interval: formData.recurrence_interval ? parseInt(formData.recurrence_interval, 10) : null,
        status: formData.status,
        energy_level: parseInt(formData.energy_level, 10),
        tag: formData.tag ?? null,
      }
      await onSubmit(submitData)
      setFormData({
        title: '',
        description: '',
        date: '',
        recurrence_interval: '',
        status: normalizedInitialStatus,
        energy_level: 3,
        tag: null,
      })
    } catch (err) {
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="task-form-container">
      <form className="task-form" onSubmit={handleSubmit}>
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <div className="form-title-row">
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              disabled={isSubmitting}
            />
            <TagPicker
              tags={tags}
              value={formData.tag}
              onChange={(id) => setFormData((prev) => ({ ...prev, tag: id }))}
              onTagsChange={onTagsChange ?? (() => {})}
            />
          </div>
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Task description (optional)"
            rows="4"
            disabled={isSubmitting}
          />
        </div>

        <div className={`form-row${showStatusField ? '' : ' form-row-single'}`}>
          {showStatusField ? (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="energy_level" className="label-with-help">
              Energy Level
              <span
                className="help-icon"
                aria-label="Expected energy cost to complete this task."
                tabIndex={0}
              >
                !
                <span className="help-tooltip" role="tooltip">
                  Expected energy cost to complete this task.
                </span>
              </span>
            </label>
            <select
              id="energy_level"
              name="energy_level"
              value={formData.energy_level}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="1">Very Low</option>
              <option value="2">Low</option>
              <option value="3">Medium</option>
              <option value="4">High</option>
              <option value="5">Very High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Due Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date ?? ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          {!task?.recurrence_origin && (
            <div className="form-group">
              <label htmlFor="recurrence_interval" className="label-with-help">
                Repeat every
                <span
                  className="help-icon"
                  aria-label="Creates a new task this many days after the due date."
                  tabIndex={0}
                >
                  !
                  <span className="help-tooltip" role="tooltip">
                    Creates a new task this many days after the due date.
                  </span>
                </span>
              </label>
              <div className="form-recurrence-row">
                <input
                  id="recurrence_interval"
                  type="number"
                  name="recurrence_interval"
                  min="1"
                  value={formData.recurrence_interval ?? ''}
                  onChange={handleChange}
                  placeholder="—"
                  disabled={isSubmitting}
                />
                <span className="form-recurrence-unit">days</span>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm
