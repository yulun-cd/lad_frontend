import { useState, useEffect } from 'react'
import { tasksService } from '../services/tasks'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import '../styles/tasks.css'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    const resetTasksView = () => {
      setShowForm(false)
      setEditingTask(null)
      setError(null)
      setDraggedTaskId(null)
      setDragOverStatus(null)
    }

    window.addEventListener('tasks:reset-view', resetTasksView)
    return () => {
      window.removeEventListener('tasks:reset-view', resetTasksView)
    }
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tasksService.getTasks()
      setTasks(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await tasksService.createTask(taskData)
      await fetchTasks()
      setShowForm(false)
    } catch (err) {
      setError('Failed to create task. Please try again.')
      console.error('Error creating task:', err)
    }
  }

  const handleUpdateTask = async (id, taskData) => {
    const existingTask = tasks.find((task) => task.id === id)
    const nextStatus = taskData?.status ? String(taskData.status).toUpperCase() : null
    const becameCompleted = (
      existingTask &&
      existingTask.status !== 'COMPLETED' &&
      nextStatus === 'COMPLETED'
    )

    try {
      await tasksService.updateTask(id, taskData)
      await fetchTasks()
      setEditingTask(null)

      if (becameCompleted) {
        window.dispatchEvent(new CustomEvent('tasks:completed'))
      }
    } catch (err) {
      setError('Failed to update task. Please try again.')
      console.error('Error updating task:', err)
    }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }
    try {
      await tasksService.deleteTask(id)
      await fetchTasks()
    } catch (err) {
      setError('Failed to delete task. Please try again.')
      console.error('Error deleting task:', err)
    }
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverStatus(null)
  }

  const handleDragOverColumn = (e, status) => {
    e.preventDefault()
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDropOnColumn = async (e, targetStatus) => {
    e.preventDefault()
    setDragOverStatus(null)

    if (!draggedTaskId) return

    const draggedTask = tasks.find((task) => task.id === draggedTaskId)
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTaskId(null)
      return
    }

    const previousTasks = tasks
    setTasks((prev) => prev.map((task) => (
      task.id === draggedTaskId ? { ...task, status: targetStatus } : task
    )))
    setDraggedTaskId(null)

    try {
      await tasksService.updateTask(draggedTaskId, { status: targetStatus })
      await fetchTasks()

      if (targetStatus === 'COMPLETED') {
        window.dispatchEvent(new CustomEvent('tasks:completed'))
      }
    } catch (err) {
      setTasks(previousTasks)
      setError('Failed to move task. Please try again.')
      console.error('Error moving task:', err)
    }
  }

  const latestTimestampValue = (task) => {
    const createdAt = Date.parse(task.created_at || '')
    const updatedAt = Date.parse(task.updated_at || '')
    const createdValue = Number.isNaN(createdAt) ? 0 : createdAt
    const updatedValue = Number.isNaN(updatedAt) ? 0 : updatedAt
    return Math.max(createdValue, updatedValue)
  }

  const sortByLatestTimestampDesc = (a, b) => (
    latestTimestampValue(b) - latestTimestampValue(a)
  )

  const inProgressTasks = tasks
    .filter((task) => task.status === 'IN_PROGRESS')
    .sort(sortByLatestTimestampDesc)

  const pendingTasks = tasks
    .filter((task) => task.status === 'PENDING')
    .sort(sortByLatestTimestampDesc)

  const completedTasks = tasks
    .filter((task) => task.status === 'COMPLETED')
    .sort(sortByLatestTimestampDesc)

  const columns = [
    { key: 'IN_PROGRESS', title: 'In Progress', tasks: inProgressTasks },
    { key: 'PENDING', title: 'Pending', tasks: pendingTasks },
  ]

  if (showCompleted) {
    columns.push({ key: 'COMPLETED', title: 'Completed', tasks: completedTasks })
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>My Tasks</h1>
        <div className="tasks-header-controls">
          <label className="show-completed-toggle">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Show Completed
          </label>
          <button
            className="primary"
            onClick={() => {
              setEditingTask(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? 'Close' : '+ Add Task'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
        />
      )}

      <div className={`kanban-board${showCompleted ? ' kanban-board--three' : ''}`}>
        {columns.map((column) => (
          <section
            key={column.key}
            className={`kanban-column status-${column.key.toLowerCase()} ${dragOverStatus === column.key ? 'drop-target' : ''}`}
            onDragOver={(e) => handleDragOverColumn(e, column.key)}
            onDrop={(e) => handleDropOnColumn(e, column.key)}
          >
            <div className="kanban-column-header">
              <h2>{column.title}</h2>
              <span>{column.tasks.length}</span>
            </div>

            <div className="kanban-column-content">
              {column.tasks.length === 0 ? (
                <p className="empty-message">No tasks in this column.</p>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`kanban-task-item ${draggedTaskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      showCompleteCheckbox={task.status === 'PENDING' || task.status === 'IN_PROGRESS'}
                      onMarkCompleted={() => handleUpdateTask(task.id, { status: 'COMPLETED' })}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default TasksPage
