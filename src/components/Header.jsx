import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/header.css'

export function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth()
  const navigate = useNavigate()

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
              <Link to="/tasks" className="nav-link">
                Tasks
              </Link>
              <Link to="/daily-logs" className="nav-link">
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
