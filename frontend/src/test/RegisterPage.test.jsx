import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RegisterPage from '../pages/RegisterPage'
import { AuthProvider } from '../context/AuthContext'

// Mock the API calls
vi.mock('../services/api', () => ({
  authApi: {
    register: vi.fn().mockResolvedValue({ data: {} }),
    login: vi.fn().mockResolvedValue({ data: { token: 'mock-token', email: 'test@example.com', name: 'Test', role: 'ADMIN' } }),
  }
}))

describe('RegisterPage Role Option', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the role clearance select option with default USER', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const select = screen.getByLabelText(/Role Clearance/i)
    expect(select).toBeInTheDocument()
    expect(select.value).toBe('USER')
  })

  it('allows selecting ADMIN role', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const select = screen.getByLabelText(/Role Clearance/i)
    fireEvent.change(select, { target: { value: 'ADMIN' } })
    expect(select.value).toBe('ADMIN')
  })

  it('rejects passwords without a number and an uppercase letter', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInput, { target: { value: 'simplepassword' } }) // Valid length but no uppercase/number
    
    const submitButton = screen.getByRole('button', { name: /Sign Up/i })
    fireEvent.click(submitButton)

    const errorMsg = await screen.findByText(/Password must contain at least one uppercase letter and one number/i)
    expect(errorMsg).toBeInTheDocument()
  })
})
