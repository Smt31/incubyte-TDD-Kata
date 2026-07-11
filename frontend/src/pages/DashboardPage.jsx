import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { vehicleApi } from '../services/api'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // State
  const [vehicles, setVehicles] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [restockInputs, setRestockInputs] = useState({})
  const [form, setForm] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    quantity: 1,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  const showNotification = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }

  // Fetch fleet
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const res = await vehicleApi.getAll()
      setVehicles(res.data || [])
    } catch (err) {
      console.error('Failed to fetch vehicles', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Input change
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  // Create vehicle
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Front-end validation
    if (!form.vin || form.vin.trim().length < 4) {
      setError('VIN must be at least 4 characters long')
      return
    }
    if (!form.make.trim()) {
      setError('Make is required')
      return
    }
    if (!form.model.trim()) {
      setError('Model is required')
      return
    }
    const yearVal = parseInt(form.year)
    if (isNaN(yearVal) || yearVal < 1886) {
      setError('Enter a valid year (1886 or later)')
      return
    }
    const priceVal = parseFloat(form.price)
    if (isNaN(priceVal) || priceVal <= 0) {
      setError('Price must be greater than zero')
      return
    }
    if (!form.category.trim()) {
      setError('Category is required')
      return
    }
    const qtyVal = parseInt(form.quantity)
    if (isNaN(qtyVal) || qtyVal < 0) {
      setError('Quantity cannot be negative')
      return
    }

    try {
      const payload = {
        vin: form.vin.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: yearVal,
        price: priceVal,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        category: form.category.trim(),
        quantity: qtyVal,
      }

      const res = await vehicleApi.create(payload)
      setVehicles([...vehicles, res.data])
      setShowAddModal(false)
      setForm({
        vin: '',
        make: '',
        model: '',
        year: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        quantity: 1,
      })
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Failed to add vehicle'
      setError(serverMsg)
    }
  }

  // Purchase vehicle
  const handlePurchase = async (id) => {
    try {
      const res = await vehicleApi.purchase(id)
      setVehicles(vehicles.map((v) => (v.id === id ? res.data : v)))
      showNotification('Vehicle purchased successfully!', 'success')
    } catch (err) {
      showNotification(err.response?.data?.message || 'Purchase failed', 'error')
    }
  }

  // Restock vehicle
  const handleRestock = async (id) => {
    const amount = restockInputs[id]
    const parsedAmount = parseInt(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showNotification('Please enter a restock quantity of 1 or more', 'error')
      return
    }

    try {
      const res = await vehicleApi.restock(id, parsedAmount)
      setVehicles(vehicles.map((v) => (v.id === id ? res.data : v)))
      setRestockInputs({ ...restockInputs, [id]: '' })
      showNotification('Vehicle restocked successfully!', 'success')
    } catch (err) {
      showNotification(err.response?.data?.message || 'Restock failed', 'error')
    }
  }

  const handleRestockInputChange = (id, val) => {
    setRestockInputs({ ...restockInputs, [id]: val })
  }

  // Delete vehicle
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle from the collection?')) {
      try {
        await vehicleApi.delete(id)
        setVehicles(vehicles.filter((v) => v.id !== id))
        showNotification('Vehicle deleted from inventory successfully.', 'success')
      } catch (err) {
        showNotification('Failed to delete vehicle', 'error')
      }
    }
  }

  const isAdmin = user?.role === 'ADMIN'

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
        <div className="portal-header-row">
          <div className="portal-welcome">
            <h1 className="portal-welcome-title">Welcome, {user?.name}</h1>
            <p className="portal-welcome-desc">Private collection dashboard & precision inventory tracking.</p>
          </div>
          {isAdmin && (
            <button className="btn-add-vehicle" onClick={() => setShowAddModal(true)}>
              + Add Vehicle
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dfba73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div className="portal-card-title">Active Fleet</div>
            <div className="portal-card-value">{vehicles.length}</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dfba73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="portal-card-title">Pending Delivery</div>
            <div className="portal-card-value">0</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dfba73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <div className="portal-card-title">Role Clearance</div>
            <div className="portal-card-value" style={{ fontSize: '16px', color: '#dfba73' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Fleet Listings */}
        <div className="fleet-section">
          <h2 className="fleet-title">Available Luxury Inventory</h2>

          {loading ? (
            <div className="fleet-loading">Calibrating telemetry systems...</div>
          ) : vehicles.length === 0 ? (
            <div className="fleet-empty-state">
              <p>No high-performance vehicles in the database catalog.</p>
              {isAdmin && <p style={{ fontSize: '14px', color: '#dfba73', marginTop: '8px' }}>Use the "Add Vehicle" system above to catalog the first supercar.</p>}
            </div>
          ) : (
            <div className="fleet-grid">
              {vehicles.map((v) => (
                <div className="fleet-card" key={v.id}>
                  <div className="fleet-card-img-container">
                    {v.imageUrl ? (
                      <img
                        src={v.imageUrl}
                        alt={`${v.make} ${v.model}`}
                        className="fleet-card-img"
                      />
                    ) : (
                      <div className="fleet-card-img-placeholder">
                        <svg viewBox="0 0 100 40" className="car-silhouette" fill="none" stroke="var(--accent-gold)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '65%', opacity: 0.8 }}>
                          <path d="M 2,34 L 12,34 A 5.5,5.5 0 0,1 23,34 L 57,34 A 5.5,5.5 0 0,1 68,34 L 94,34 C 96,34 98,32 98,30 C 98,28 97,27 95,26 L 88,23 C 85,22 81,18 78,14 L 60,11 C 55,10 40,10 32,13 L 16,18 C 10,20 6,24 4,26 L 2,30 Z" />
                          <path d="M 33,14 L 57,12 L 68,16 L 76,21 C 70,22 62,22 55,22 Z" strokeWidth="0.6" opacity="0.8" />
                          <path d="M 49,12 L 49,22" strokeWidth="0.6" opacity="0.8" />
                          <circle cx="17.5" cy="34" r="5.5" stroke="var(--accent-gold)" strokeWidth="0.8" fill="#18181b" />
                          <circle cx="17.5" cy="34" r="3.2" stroke="var(--accent-gold)" strokeWidth="0.6" />
                          <circle cx="62.5" cy="34" r="5.5" stroke="var(--accent-gold)" strokeWidth="0.8" fill="#18181b" />
                          <circle cx="62.5" cy="34" r="3.2" stroke="var(--accent-gold)" strokeWidth="0.6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="fleet-card-details">
                    <div className="fleet-card-header">
                      <span className="fleet-card-year">{v.year}</span>
                      <span className="fleet-card-price">
                        ${v.price ? v.price.toLocaleString('en-US') : '0'}
                      </span>
                    </div>
                    <h3 className="fleet-card-title">{v.make} {v.model}</h3>
                    <p className="fleet-card-desc">{v.description || 'No description cataloged for this model.'}</p>
                    <div className="fleet-card-meta">
                      <span>VIN: <code>{v.vin}</code></span>
                      <span>Category: <strong style={{ color: '#dfba73' }}>{v.category}</strong></span>
                      <span>Stock: <strong style={{ color: v.quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {v.quantity > 0 ? `${v.quantity} units` : 'Out of Stock'}
                      </strong></span>
                    </div>
                    <div className="fleet-card-actions">
                      <button
                        className="btn-fleet-purchase"
                        onClick={() => handlePurchase(v.id)}
                        disabled={v.quantity <= 0}
                      >
                        {v.quantity > 0 ? 'Purchase' : 'Out of Stock'}
                      </button>

                      {isAdmin && (
                        <div className="admin-actions-row">
                          <button className="btn-fleet-delete" onClick={() => handleDelete(v.id)}>
                            Delete
                          </button>
                          <div className="restock-control">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={restockInputs[v.id] || ''}
                              onChange={(e) => handleRestockInputChange(v.id, e.target.value)}
                              className="restock-input"
                            />
                            <button className="btn-fleet-restock" onClick={() => handleRestock(v.id)}>
                              Restock
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Catalog New Luxury Vehicle</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="auth-error-box">{error}</div>}

              <div className="form-group-row">
                <div className="form-input-group">
                  <label>VIN (Vehicle Identification Number)</label>
                  <input
                    type="text"
                    name="vin"
                    placeholder="VIN (min 4 characters)"
                    value={form.vin}
                    onChange={handleInputChange}
                    maxLength={30}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row-2col">
                <div className="form-input-group">
                  <label>Make / Brand</label>
                  <input
                    type="text"
                    name="make"
                    placeholder="Make"
                    value={form.make}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-input-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="Model"
                    value={form.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row-2col">
                <div className="form-input-group">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    value={form.year}
                    onChange={handleInputChange}
                    min={1886}
                    required
                  />
                </div>
                <div className="form-input-group">
                  <label>Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group-row-2col">
                <div className="form-input-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g. SUV, Sedan, Coupe"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-input-group">
                  <label>Initial Stock Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Initial Stock"
                    value={form.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={form.imageUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-input-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Enter vehicle specifics, condition, and options..."
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Toast Notifications Stack */}
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast-message toast-${n.type}`}>
            <span className="toast-icon">
              {n.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </span>
            <div className="toast-text">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
