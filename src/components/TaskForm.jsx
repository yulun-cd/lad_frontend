import { useState, useEffect } from 'react'
import '../styles/task-form.css'

function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    energy_level: 3,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData(task)
    }
  }, [task])

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
        status: formData.status,
        energy_level: parseInt(formData.energy_level, 10),
      }
      await onSubmit(submitData)
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        energy_level: 3,
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
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title"
            disabled={isSubmitting}
          />
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

        <div className="form-row">
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
