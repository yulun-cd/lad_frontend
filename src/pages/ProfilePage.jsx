import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/profile.css'

function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>My Profile</h1>
          </div>

          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="profile-info">
              <div className="info-row">
                <label>Email:</label>
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Account Settings</h2>
            <div className="profile-actions">
              <button
                onClick={handleLogout}
                className="danger-button"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="profile-footer">
            <p className="text-muted">
              Last login: {currentUser?.last_login ? new Date(currentUser.last_login).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
