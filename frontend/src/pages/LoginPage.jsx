import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.email.trim()) newErrors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address'
    if (!form.password.trim()) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters long'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login({ email: data.email, name: data.name, role: data.role }, data.token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="velodrive-container">
      {/* Brand Header */}
      <div className="velodrive-brand">
        <h1 className="velodrive-title">VeloDrive</h1>
        <p className="velodrive-subtitle">The standard in precision performance.</p>
      </div>

      {/* Login Card */}
      <div className="velodrive-card">
        <div className="velodrive-card-header">
          <h2 className="velodrive-card-title">Welcome Back</h2>
          <p className="velodrive-card-desc">Enter your credentials to access your private collection.</p>
        </div>

        {serverError && (
          <div className="alert-message alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-email">Email Address</label>
            </div>
            <div className="input-wrapper">
              <input
                id="login-email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error-border' : ''}`}
                placeholder="name@domain.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <svg 
                className="input-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">Password</label>
            </div>
            <div className="input-wrapper">
              <input
                id="login-password"
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'error-border' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <svg 
                className="input-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="btn-gold" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                Sign In &nbsp; →
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Register */}
      <p className="footer-text">
        New to VeloDrive? <Link to="/register" className="footer-link">Register</Link>
      </p>
    </div>
  )
}
