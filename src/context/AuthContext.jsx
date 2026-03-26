import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setCurrentUser(JSON.parse(storedUser))
          setIsAuthenticated(true)

          // Verify token is still valid by fetching user info
          try {
            const user = await authService.getMe()
            setCurrentUser(user)
            localStorage.setItem('user', JSON.stringify(user))
          } catch (err) {
            // Token validation failed, user will be logged out
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            setToken(null)
            setCurrentUser(null)
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (identifier, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await authService.login(identifier, password)
      const { access, refresh } = data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      setToken(access)
      setIsAuthenticated(true)

      // Login should succeed once token pair is obtained.
      // Fetching /me can fail due to backend auth timing/config; handle it as non-fatal.
      const isEmailLogin = String(identifier).includes('@')
      let user = isEmailLogin
        ? { email: identifier }
        : { username: identifier }
      try {
        user = await authService.getMe()
      } catch (meError) {
        console.warn('Login succeeded but fetching user profile failed:', meError)
      }

      localStorage.setItem('user', JSON.stringify(user))
      setCurrentUser(user)
      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (username, email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.register({ username, email, password })
      return { success: true }
    } catch (err) {
      const errorMessage =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) {
        logout()
        return false
      }

      const data = await authService.refresh(refreshTokenValue)
      const { access, refresh } = data

      localStorage.setItem('access_token', access)
      if (refresh) {
        localStorage.setItem('refresh_token', refresh)
      }

      setToken(access)
      return true
    } catch (err) {
      logout()
      return false
    }
  }, [logout])

  const value = {
    currentUser,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
