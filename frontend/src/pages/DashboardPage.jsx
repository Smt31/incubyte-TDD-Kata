import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="portal-layout">
      {/* Navbar */}
      <nav className="portal-nav">
        <div className="portal-brand">VeloDrive</div>
        <div className="portal-user-info">
          <span className="portal-role-tag">{user?.role}</span>
          <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
            User: <strong style={{ color: '#ffffff' }}>{user?.name}</strong>
          </span>
          <button className="btn-portal-signout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="portal-content">
        <div className="portal-welcome">
          <h1 className="portal-welcome-title">Welcome, {user?.name}</h1>
          <p className="portal-welcome-desc">Private collection dashboard & precision inventory tracking.</p>
        </div>

        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-card-icon">🚘</div>
            <div className="portal-card-title">Active Fleet</div>
            <div className="portal-card-value">0</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-icon">⏱️</div>
            <div className="portal-card-title">Pending Delivery</div>
            <div className="portal-card-value">0</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-icon">🔑</div>
            <div className="portal-card-title">Role Clearance</div>
            <div className="portal-card-value" style={{ fontSize: '16px', color: '#dfba73' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
