import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
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
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address'
    if (!form.password.trim()) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters long'
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) newErrors.password = 'Password must contain at least one uppercase letter and one number'
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
      await authApi.register(form)
      // Auto login after registration
      const { data } = await authApi.login({ email: form.email, password: form.password })
      login({ email: data.email, name: data.name, role: data.role }, data.token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Email already exists'
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

      {/* Register Card */}
      <div className="velodrive-card">
        <div className="velodrive-card-header">
          <h2 className="velodrive-card-title">Create Account</h2>
          <p className="velodrive-card-desc">Sign up below to request access to the private collection.</p>
        </div>

        {serverError && (
          <div className="alert-message alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="register-name">Full Name</label>
            </div>
            <div className="input-wrapper">
              <input
                id="register-name"
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'error-border' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="register-email">Email Address</label>
            </div>
            <div className="input-wrapper">
              <input
                id="register-email"
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

          {/* Password Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="register-password">Password</label>
            </div>
            <div className="input-wrapper">
              <input
                id="register-password"
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'error-border' : ''}`}
                placeholder="•••••••• (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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

          {/* Role Field */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <div className="form-label-row">
              <label className="form-label" htmlFor="register-role">Role Clearance</label>
            </div>
            <div className="input-wrapper">
              <select
                id="register-role"
                name="role"
                className="form-input"
                value={form.role}
                onChange={handleChange}
                style={{ appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
              >
                <option value="USER" style={{ background: 'var(--bg-card)' }}>User (Standard)</option>
                <option value="ADMIN" style={{ background: 'var(--bg-card)' }}>Admin (Manager)</option>
              </select>
              <svg 
                className="input-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <svg
                style={{ position: 'absolute', right: '14px', width: '16px', height: '16px', color: 'var(--text-muted)', pointerEvents: 'none' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
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
                Creating...
              </>
            ) : (
              <>
                Sign Up &nbsp; →
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Login */}
      <p className="footer-text">
        Already have an account? <Link to="/login" className="footer-link">Sign in</Link>
      </p>
    </div>
  )
}
