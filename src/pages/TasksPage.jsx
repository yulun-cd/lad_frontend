import { useState, useEffect, useRef } from 'react'
import { tasksService } from '../services/tasks'
import { taskTagsService } from '../services/taskTags'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import '../styles/tasks.css'

function TagFilter({ tags, selectedTagIds, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (id) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((x) => x !== id)
        : [...selectedTagIds, id]
    )
  }

  const label =
    selectedTagIds.length === 0
      ? 'All tags'
      : selectedTagIds.length === 1
        ? (tags.find((t) => t.id === selectedTagIds[0])?.name ?? '1 tag')
        : `${selectedTagIds.length} tags`

  return (
    <div className="tag-filter" ref={ref}>
      <button
        type="button"
        className={`tag-filter-btn${open ? ' tag-filter-btn--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {selectedTagIds.length > 0 && (
          <span className="tag-filter-dots">
            {selectedTagIds.slice(0, 4).map((id) => {
              const tag = tags.find((t) => t.id === id)
              return tag ? (
                <span key={id} className="tag-filter-dot" style={{ background: tag.color }} />
              ) : null
            })}
          </span>
        )}
        <span>{label}</span>
        <span className="tag-filter-caret">▾</span>
      </button>
      {open && (
        <div className="tag-filter-dropdown">
          {tags.length === 0 && <p className="tag-filter-empty">No tags</p>}
          {tags.map((tag) => (
            <label key={tag.id} className="tag-filter-option">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => toggle(tag.id)}
              />
              <span className="tag-filter-dot" style={{ background: tag.color }} />
              <span className="tag-filter-name">{tag.name}</span>
            </label>
          ))}
          {selectedTagIds.length > 0 && (
            <button type="button" className="tag-filter-clear" onClick={() => onChange([])}>
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [addingStatus, setAddingStatus] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const [selectedTagIds, setSelectedTagIds] = useState([])

  useEffect(() => {
    taskTagsService.getTags().then(setTags).catch(() => {})
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTasks() }, [selectedTagIds.join(',')])

  useEffect(() => {
    const resetTasksView = () => {
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
      const params = selectedTagIds.length > 0 ? { tag: selectedTagIds } : {}
      const data = await tasksService.getTasks(params)
      setTasks(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
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

  const handleCreateTask = async (taskData) => {
    try {
      await tasksService.createTask(taskData)
      await fetchTasks()
      setAddingStatus(null)
    } catch (err) {
      setError('Failed to create task. Please try again.')
      console.error('Error creating task:', err)
    }
  }

  const handleTagChange = async (taskId, tagId) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, tag: tagId } : t)))
    try {
      await tasksService.updateTask(taskId, { tag: tagId })
      await fetchTasks()
    } catch (err) {
      setError('Failed to update tag.')
      console.error('Error updating task tag:', err)
      await fetchTasks()
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
    setDragOverTaskId(null)
  }

  const handleDragOverColumn = (e, status) => {
    e.preventDefault()
    setDragOverStatus(status)
    setDragOverTaskId(null)
  }

  const handleDragOverTask = (e, taskId, status) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverStatus(status)
    setDragOverTaskId(taskId)
  }

  const handleDropOnTask = async (e, targetTaskId, columnStatus, columnTasks) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverStatus(null)
    setDragOverTaskId(null)

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null)
      return
    }

    const draggedTask = tasks.find((t) => t.id === draggedTaskId)
    if (!draggedTask) { setDraggedTaskId(null); return }

    const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId)
    const targetPosition = targetIndex + 1

    if (draggedTask.status === columnStatus) {
      // Same-column reorder
      const previousTasks = tasks
      const reordered = columnTasks.filter((t) => t.id !== draggedTaskId)
      reordered.splice(targetIndex, 0, draggedTask)
      const updatedPositions = reordered.map((t, i) => ({ ...t, position: i + 1 }))
      setTasks((prev) => [
        ...prev.filter((t) => t.status !== columnStatus),
        ...updatedPositions,
      ])
      setDraggedTaskId(null)
      try {
        await tasksService.patchTask(draggedTaskId, { position: targetPosition })
      } catch (err) {
        setTasks(previousTasks)
        setError('Failed to reorder task. Please try again.')
        console.error('Error reordering task:', err)
      }
    } else {
      // Cross-column: change status and position together
      const previousTasks = tasks
      setTasks((prev) => {
        const movedTask = prev.find((t) => t.id === draggedTaskId)
        if (!movedTask) return prev

        const sourceStatus = movedTask.status
        const sourceWithoutMoved = prev.filter((t) => !(t.id === draggedTaskId && t.status === sourceStatus))
        const sourceReindexed = sourceWithoutMoved
          .filter((t) => t.status === sourceStatus)
          .map((t, i) => ({ ...t, position: i + 1 }))

        const targetColumn = sourceWithoutMoved.filter((t) => t.status === columnStatus)
        const beforeTarget = targetColumn.slice(0, targetIndex)
        const afterTarget = targetColumn.slice(targetIndex)
        const movedInTarget = [
          ...beforeTarget,
          { ...movedTask, status: columnStatus, position: targetPosition },
          ...afterTarget,
        ].map((t, i) => ({ ...t, position: i + 1 }))

        const untouched = sourceWithoutMoved.filter((t) => t.status !== sourceStatus && t.status !== columnStatus)
        return [...untouched, ...sourceReindexed, ...movedInTarget]
      })
      setDraggedTaskId(null)
      try {
        await tasksService.patchTask(draggedTaskId, { status: columnStatus, position: targetPosition })
        await fetchTasks()
        if (columnStatus === 'COMPLETED') {
          window.dispatchEvent(new CustomEvent('tasks:completed'))
        }
      } catch (err) {
        setTasks(previousTasks)
        setError('Failed to move task. Please try again.')
        console.error('Error moving task:', err)
      }
    }
  }

  const handleDropOnColumn = async (e, targetStatus, columnTasks) => {
    e.preventDefault()
    setDragOverStatus(null)
    setDragOverTaskId(null)

    if (!draggedTaskId) return

    const draggedTask = tasks.find((t) => t.id === draggedTaskId)
    if (!draggedTask) { setDraggedTaskId(null); return }

    if (draggedTask.status === targetStatus) {
      // Same-column: move to end
      const otherTasks = columnTasks.filter((t) => t.id !== draggedTaskId)
      const targetIndex = otherTasks.length
      const targetPosition = targetIndex + 1
      const previousTasks = tasks
      const reordered = [...otherTasks, draggedTask].map((t, i) => ({ ...t, position: i + 1 }))
      setTasks((prev) => [
        ...prev.filter((t) => t.status !== targetStatus),
        ...reordered,
      ])
      setDraggedTaskId(null)
      try {
        await tasksService.patchTask(draggedTaskId, { position: targetPosition })
      } catch (err) {
        setTasks(previousTasks)
        setError('Failed to reorder task. Please try again.')
        console.error('Error reordering task:', err)
      }
    } else {
      // Cross-column: move to end and update status+position together
      const targetPosition = columnTasks.length + 1
      const previousTasks = tasks
      setTasks((prev) => {
        const movedTask = prev.find((t) => t.id === draggedTaskId)
        if (!movedTask) return prev

        const sourceStatus = movedTask.status
        const sourceWithoutMoved = prev.filter((t) => !(t.id === draggedTaskId && t.status === sourceStatus))
        const sourceReindexed = sourceWithoutMoved
          .filter((t) => t.status === sourceStatus)
          .map((t, i) => ({ ...t, position: i + 1 }))

        const targetColumn = sourceWithoutMoved.filter((t) => t.status === targetStatus)
        const movedInTarget = [...targetColumn, { ...movedTask, status: targetStatus }]
          .map((t, i) => ({ ...t, position: i + 1 }))

        const untouched = sourceWithoutMoved.filter((t) => t.status !== sourceStatus && t.status !== targetStatus)
        return [...untouched, ...sourceReindexed, ...movedInTarget]
      })
      setDraggedTaskId(null)
      try {
        await tasksService.patchTask(draggedTaskId, { status: targetStatus, position: targetPosition })
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
  }

  const latestTimestampValue = (task) => {
    const createdAt = Date.parse(task.created_at || '')
    const updatedAt = Date.parse(task.updated_at || '')
    const createdValue = Number.isNaN(createdAt) ? 0 : createdAt
    const updatedValue = Number.isNaN(updatedAt) ? 0 : updatedAt
    return Math.max(createdValue, updatedValue)
  }

  const inProgressTasks = tasks.filter((task) => task.status === 'IN_PROGRESS')
  const pendingTasks = tasks.filter((task) => task.status === 'PENDING')
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')

  const columns = [
    { key: 'IN_PROGRESS', title: 'In Progress', tasks: inProgressTasks },
    { key: 'PENDING', title: 'Pending', tasks: pendingTasks },
  ]

  if (showCompleted) {
    columns.push({ key: 'COMPLETED', title: 'Completed', tasks: completedTasks })
  }

  const getAddButtonLabel = (status) => {
    if (status === 'IN_PROGRESS') return '+ Add In Progress Task'
    if (status === 'PENDING') return '+ Add Pending Task'
    return '+ Add Task'
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
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
          <label className="show-completed-toggle">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Show Completed
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {editingTask && (
        <div className="task-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null) }}>
          <div className="task-modal">
            <TaskForm
              task={editingTask}
              onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
              onCancel={() => setEditingTask(null)}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>
        </div>
      )}

      {addingStatus && (
        <div className="task-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAddingStatus(null) }}>
          <div className="task-modal">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setAddingStatus(null)}
              initialStatus={addingStatus}
              showStatusField={false}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>
        </div>
      )}

      <div className={`kanban-board${showCompleted ? ' kanban-board--three' : ''}`}>
        {columns.map((column) => (
          <section
            key={column.key}
            className={`kanban-column status-${column.key.toLowerCase()} ${dragOverStatus === column.key && !dragOverTaskId ? 'drop-target' : ''}`}
            onDragOver={(e) => handleDragOverColumn(e, column.key)}
            onDrop={(e) => handleDropOnColumn(e, column.key, column.tasks)}
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
                    className={`kanban-task-item ${draggedTaskId === task.id ? 'dragging' : ''} ${dragOverTaskId === task.id ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOverTask(e, task.id, column.key)}
                    onDrop={(e) => handleDropOnTask(e, task.id, column.key, column.tasks)}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      showCompleteCheckbox={task.status === 'PENDING' || task.status === 'IN_PROGRESS'}
                      onMarkCompleted={() => handleUpdateTask(task.id, { status: 'COMPLETED' })}
                      tags={tags}
                      onTagChange={handleTagChange}
                      onTagsChange={setTags}
                    />
                  </div>
                ))
              )}
            </div>

            {(column.key === 'IN_PROGRESS' || column.key === 'PENDING') && (
              <div className="kanban-column-footer">
                <button
                  type="button"
                  className="secondary column-add-task-btn"
                  onClick={() => setAddingStatus(column.key)}
                >
                  {getAddButtonLabel(column.key)}
                </button>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default TasksPage
