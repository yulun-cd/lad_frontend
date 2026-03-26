import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/header.css'

export function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{currentUser?.email}</span>
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
