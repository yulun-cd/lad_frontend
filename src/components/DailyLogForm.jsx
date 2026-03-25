import { useMemo, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { format, isAfter, parseISO, startOfDay } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import '../styles/daily-log-form.css'

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd')
const toDayString = (date) => format(date, 'yyyy-MM-dd')
const toDate = (dayString) => {
  if (!dayString) return null
  return parseISO(dayString)
}

function DailyLogForm({ log, existingLogDates = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    date: '',
    overall: 3,
    energy: 3,
    emotion: 3,
    productivity: 3,
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (log) {
      setFormData(log)
    } else {
      setFormData((prev) => ({
        ...prev,
        date: getTodayDateString(),
      }))
    }
  }, [log])

  const blockedDateSet = useMemo(() => {
    const currentLogDate = log?.date
    return new Set(
      existingLogDates.filter((dateString) => dateString && dateString !== currentLogDate)
    )
  }, [existingLogDates, log])

  const isDateDisabled = (date) => {
    const day = toDayString(date)
    const isFutureDate = isAfter(startOfDay(date), startOfDay(new Date()))
    return isFutureDate || blockedDateSet.has(day)
  }

  const getDayClassName = (date) => {
    const day = toDayString(date)
    return blockedDateSet.has(day) ? 'has-log-day' : undefined
  }

  const handleDateChange = (date) => {
    const nextDate = date ? toDayString(date) : ''
    setFormData((prev) => ({
      ...prev,
      date: nextDate,
    }))

    if (errors.date) {
      setErrors((prev) => ({
        ...prev,
        date: '',
      }))
    }
  }

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
    const today = getTodayDateString()

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else if (formData.date > today) {
      newErrors.date = 'Future dates are not allowed'
    } else if (blockedDateSet.has(formData.date)) {
      newErrors.date = 'A daily log already exists for this date'
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
        date: formData.date,
        overall: parseInt(formData.overall, 10),
        energy: parseInt(formData.energy, 10),
        emotion: parseInt(formData.emotion, 10),
        productivity: parseInt(formData.productivity, 10),
        description: formData.description,
      }
      await onSubmit(submitData)
      setFormData({
        date: getTodayDateString(),
        overall: 3,
        energy: 3,
        emotion: 3,
        productivity: 3,
        description: '',
      })
    } catch (err) {
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="daily-log-form-container">
      <form className="daily-log-form" onSubmit={handleSubmit}>
        <h2>{log ? 'Edit Daily Log' : 'Create New Daily Log'}</h2>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <DatePicker
            id="date"
            selected={toDate(formData.date)}
            onChange={handleDateChange}
            filterDate={(date) => !isDateDisabled(date)}
            dayClassName={getDayClassName}
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            placeholderText="Select date"
            className="date-picker-input"
            disabled={isSubmitting}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="overall">Overall (1–5) *</label>
            <select
              id="overall"
              name="overall"
              value={formData.overall}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="1">1 — Very Poor</option>
              <option value="2">2 — Poor</option>
              <option value="3">3 — Neutral</option>
              <option value="4">4 — Good</option>
              <option value="5">5 — Excellent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="energy">Energy (1–5) *</label>
            <select
              id="energy"
              name="energy"
              value={formData.energy}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="1">1 — Exhausted</option>
              <option value="2">2 — Tired</option>
              <option value="3">3 — Neutral</option>
              <option value="4">4 — Energized</option>
              <option value="5">5 — Very Energized</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emotion">Emotion (1–5) *</label>
            <select
              id="emotion"
              name="emotion"
              value={formData.emotion}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="1">1 — Very Low</option>
              <option value="2">2 — Low</option>
              <option value="3">3 — Neutral</option>
              <option value="4">4 — Good</option>
              <option value="5">5 — Very Good</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="productivity">Productivity (1–5) *</label>
            <select
              id="productivity"
              name="productivity"
              value={formData.productivity}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="1">1 — Very Low</option>
              <option value="2">2 — Low</option>
              <option value="3">3 — Neutral</option>
              <option value="4">4 — Productive</option>
              <option value="5">5 — Very Productive</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Notes</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Any additional notes (optional)"
            rows="4"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Log'}
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

export default DailyLogForm
