import { useEffect, useRef, useState } from 'react'
import { taskTagsService } from '../services/taskTags'
import '../styles/tags.css'

const DEFAULT_COLOR = '#6366f1'

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e', '#64748b',
]

/**
 * Unified tag picker with full inline management (create / edit / delete).
 *
 * Props:
 *   tags          – array of { id, name, color }
 *   value         – currently selected tag id (nullable)
 *   onChange      – (id | null) => void   called when assignment changes
 *   onTagsChange  – React state updater for the shared tags array
 *   variant       – 'card' (default) | 'form'
 *   disabled      – boolean (form variant only)
 */
function TagPicker({ tags, value, onChange, onTagsChange, variant = 'card', disabled = false }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [editingTag, setEditingTag] = useState(null)
  const [form, setForm] = useState({ name: '', color: DEFAULT_COLOR })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setView('list')
        setErr(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentTag = tags.find((t) => t.id === value) ?? null
  const isForm = variant === 'form'

  const toggle = () => {
    if (!disabled) {
      setOpen((v) => !v)
      setView('list')
      setErr(null)
    }
  }

  const openCreate = () => {
    setForm({ name: '', color: DEFAULT_COLOR })
    setErr(null)
    setView('create')
  }

  const openEdit = (tag, e) => {
    e.stopPropagation()
    setForm({ name: tag.name, color: tag.color })
    setEditingTag(tag)
    setErr(null)
    setView('edit')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!form.name.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const created = await taskTagsService.createTag({ name: form.name.trim(), color: form.color })
      onTagsChange((prev) => [...prev, created])
      setView('list')
    } catch {
      setErr('Failed to create tag.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!form.name.trim() || !editingTag) return
    setSaving(true)
    setErr(null)
    try {
      const updated = await taskTagsService.updateTag(editingTag.id, { name: form.name.trim(), color: form.color })
      onTagsChange((prev) => prev.map((t) => (t.id === editingTag.id ? updated : t)))
      setView('list')
    } catch {
      setErr('Failed to update tag.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tag, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete tag "${tag.name}"? It will be removed from all tasks.`)) return
    setErr(null)
    try {
      await taskTagsService.deleteTag(tag.id)
      onTagsChange((prev) => prev.filter((t) => t.id !== tag.id))
      if (value === tag.id) onChange(null)
    } catch {
      setErr('Failed to delete tag.')
    }
  }

  return (
    <div className={isForm ? 'tf-tag-select' : 'tag-picker'} ref={ref}>

      {/* ── Trigger button ── */}
      {isForm ? (
        <button
          type="button"
          className={`tf-tag-btn${open ? ' tf-tag-btn--open' : ''}`}
          onClick={toggle}
          disabled={disabled}
        >
          {currentTag ? (
            <><span className="tf-tag-dot" style={{ background: currentTag.color }} />{currentTag.name}</>
          ) : (
            <span className="tf-tag-placeholder">No tag</span>
          )}
          <span className="tf-tag-caret">▾</span>
        </button>
      ) : (
        <button
          type="button"
          className={`tag-assign-btn${currentTag ? ' tag-assign-btn--active' : ''}`}
          onClick={toggle}
          aria-label={currentTag ? `Tag: ${currentTag.name}` : 'Assign tag'}
          title={currentTag ? `Tag: ${currentTag.name}` : 'Assign tag'}
          style={currentTag ? { borderColor: currentTag.color, color: currentTag.color } : undefined}
        >
          {currentTag ? (
            <>
              <span className="tag-dot" style={{ backgroundColor: currentTag.color }} />
              <span className="tag-assign-label">{currentTag.name}</span>
            </>
          ) : (
            <svg className="tag-assign-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.3-7.3a1 1 0 0 0 0-1.41L12 2Z" />
              <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
            </svg>
          )}
        </button>
      )}

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={`tag-dropdown${isForm ? ' tf-tag-dropdown-panel' : ''}`}
          role="dialog"
          aria-label="Tag menu"
        >
          <p className="tag-dropdown-title">Task Tag</p>
          {err && <p className="tag-dropdown-error">{err}</p>}

          {view === 'list' && (
            <>
              {currentTag && (
                <button
                  type="button"
                  className="tag-dropdown-item tag-dropdown-item--clear"
                  onClick={() => { onChange(null); setOpen(false) }}
                >
                  Remove tag
                </button>
              )}

              {tags.length === 0 ? (
                <p className="tag-dropdown-empty">No tags yet.</p>
              ) : (
                <ul className="tag-dropdown-list">
                  {tags.map((tag) => (
                    <li key={tag.id} className="tag-dropdown-row">
                      <button
                        type="button"
                        className={`tag-dropdown-item${tag.id === value ? ' tag-dropdown-item--selected' : ''}`}
                        onClick={() => { onChange(tag.id); setOpen(false) }}
                      >
                        <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </button>
                      <div className="tag-row-actions">
                        <button
                          type="button"
                          className="tag-icon-btn"
                          onClick={(e) => openEdit(tag, e)}
                          aria-label={`Edit ${tag.name}`}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="tag-icon-btn tag-icon-btn--danger"
                          onClick={(e) => handleDelete(tag, e)}
                          aria-label={`Delete ${tag.name}`}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="tag-dropdown-footer">
                <button type="button" className="tag-dropdown-new-btn" onClick={openCreate}>
                  + New tag
                </button>
              </div>
            </>
          )}

          {(view === 'create' || view === 'edit') && (
            <div className="tag-inline-form">
              <p className="tag-inline-form-title">{view === 'create' ? 'New tag' : 'Edit tag'}</p>
              <div className="tag-inline-form-row">
                <div
                  className="tag-color-swatch"
                  style={{ background: form.color }}
                  title={form.color}
                />
                <input
                  type="text"
                  className="tag-name-input"
                  placeholder="Tag name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  maxLength={100}
                  autoFocus
                />
              </div>
              <div className="tag-color-palette">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`tag-palette-swatch${form.color === color ? ' tag-palette-swatch--selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <div className="tag-inline-form-actions">
                <button
                  type="button"
                  className="tag-btn tag-btn--cancel"
                  onClick={() => { setView('list'); setErr(null) }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="tag-btn tag-btn--save"
                  disabled={saving || !form.name.trim()}
                  onClick={view === 'create' ? handleCreate : handleEdit}
                >
                  {saving ? 'Saving…' : view === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TagPicker
