import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import { tasksService } from '../services/tasks'

function AddTaskPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const initialStatus = useMemo(() => {
    const status = String(searchParams.get('status') || 'PENDING').toUpperCase()
    return status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING'
  }, [searchParams])

  const statusLabel = initialStatus === 'IN_PROGRESS' ? 'In Progress' : 'Pending'
  const statusClass = initialStatus === 'IN_PROGRESS' ? 'task-create-status--in-progress' : 'task-create-status--pending'

  const handleAddTask = async (taskData) => {
    setError(null)
    try {
      await tasksService.createTask(taskData)
      navigate('/tasks', { replace: true })
    } catch (err) {
      setError('Failed to create task. Please try again.')
      console.error('Error creating task:', err)
    }
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Create Task</h1>
      </div>

      <p className="task-create-context">
        New task will start in <span className={`task-create-status ${statusClass}`}>{statusLabel}</span>.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <TaskForm
        onSubmit={handleAddTask}
        onCancel={() => navigate('/tasks')}
        initialStatus={initialStatus}
        showStatusField={false}
      />
    </div>
  )
}

export default AddTaskPage
