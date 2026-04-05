import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth'
import '../styles/profile.css'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.1 10.1 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.1 4.2" />
      <path d="M6.6 6.7C3.8 8.7 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.4 4.9-1" />
    </svg>
  )
}

function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('')
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangePasswordError('')
    setChangePasswordSuccess('')

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setChangePasswordError('Please fill in all password fields.')
      return
    }

    if (formData.newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters long.')
      return
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setChangePasswordError('New passwords do not match.')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setChangePasswordError('New password must be different from the current password.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        newPasswordConfirm: formData.confirmNewPassword,
      })

      setChangePasswordSuccess('Password updated successfully.')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (err) {
      const apiError =
        err.response?.data?.detail ||
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.new_password_confirm?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to change password. Please try again.'
      setChangePasswordError(apiError)
    } finally {
      setIsChangingPassword(false)
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
            <form className="password-form" onSubmit={handleChangePassword}>
              <div className="password-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input-wrap">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                    disabled={isChangingPassword}
                    aria-label={showPassword.current ? 'Hide current password' : 'Show current password'}
                  >
                    <EyeIcon open={showPassword.current} />
                  </button>
                </div>
              </div>

              <div className="password-form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrap">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.next ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => ({ ...prev, next: !prev.next }))}
                    disabled={isChangingPassword}
                    aria-label={showPassword.next ? 'Hide new password' : 'Show new password'}
                  >
                    <EyeIcon open={showPassword.next} />
                  </button>
                </div>
              </div>

              <div className="password-form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <div className="password-input-wrap">
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    disabled={isChangingPassword}
                    aria-label={showPassword.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <EyeIcon open={showPassword.confirm} />
                  </button>
                </div>
              </div>

              {changePasswordError ? (
                <p className="password-form-message error">{changePasswordError}</p>
              ) : null}
              {changePasswordSuccess ? (
                <p className="password-form-message success">{changePasswordSuccess}</p>
              ) : null}

              <button
                type="submit"
                className="primary-button"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>

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
