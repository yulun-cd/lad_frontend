import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { streakService } from '../services/streak'
import '../styles/header.css'

export function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [streakDays, setStreakDays] = useState(0)
  const [isStreakAnimating, setIsStreakAnimating] = useState(false)
  const previousStreakRef = useRef(0)

  const motivationalText = useMemo(() => {
    if (streakDays <= 0) return 'Start your streak today'
    if (streakDays === 1) return 'Great start, keep it alive'
    if (streakDays < 7) return 'Momentum is building'
    if (streakDays < 30) return 'Consistency champion'
    return 'Legendary consistency'
  }, [streakDays])

  const fetchStreak = async ({ triggerAnimation = false } = {}) => {
    if (!isAuthenticated) {
      setStreakDays(0)
      previousStreakRef.current = 0
      return
    }

    try {
      const raw = await streakService.getStreak()
      const nextStreak = Number(
        raw?.streak ??
          raw?.current_streak ??
          raw?.streak_days ??
          raw?.data?.streak ??
          raw?.data?.current_streak ??
          0,
      )

      const normalized = Number.isFinite(nextStreak) ? nextStreak : 0
      const previous = previousStreakRef.current

      setStreakDays(normalized)
      previousStreakRef.current = normalized

      if (triggerAnimation && normalized > previous) {
        setIsStreakAnimating(true)
        window.setTimeout(() => setIsStreakAnimating(false), 1800)
      }
    } catch (error) {
      console.error('Error loading streak:', error)
    }
  }

  useEffect(() => {
    fetchStreak()
  }, [isAuthenticated])

  useEffect(() => {
    const handleTaskCompleted = () => {
      fetchStreak({ triggerAnimation: true })
    }

    window.addEventListener('tasks:completed', handleTaskCompleted)
    return () => window.removeEventListener('tasks:completed', handleTaskCompleted)
  }, [isAuthenticated])

  const handleSameRouteClick = (path, eventName) => {
    if (location.pathname === path) {
      window.dispatchEvent(new CustomEvent(eventName))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          LAD
        </Link>

        <nav className="nav">
          {isAuthenticated && (
            <>
              <Link
                to="/tasks"
                className="nav-link"
                onClick={() => handleSameRouteClick('/tasks', 'tasks:reset-view')}
              >
                Tasks
              </Link>
              <Link
                to="/daily-logs"
                className="nav-link"
                onClick={() => handleSameRouteClick('/daily-logs', 'daily-logs:reset-view')}
              >
                Daily Logs
              </Link>
              <Link to="/visualizations" className="nav-link">
                Visualizations
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className={`streak-pill ${isStreakAnimating ? 'streak-up' : ''}`}>
                <span className="streak-count">🔥 {streakDays} day{streakDays === 1 ? '' : 's'}</span>
                <span className="streak-message">{motivationalText}</span>
              </div>
              <span className="user-name">{currentUser?.username || 'User'}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
