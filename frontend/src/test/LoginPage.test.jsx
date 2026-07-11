import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from '../pages/LoginPage'
import { AuthProvider } from '../context/AuthContext'

// Mock API
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ data: {} }),
  }
}))

describe('LoginPage Validations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects passwords shorter than 6 characters on login', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    fireEvent.change(passwordInput, { target: { value: '123' } }) // Less than 6 characters

    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    fireEvent.click(submitButton)

    const errorMsg = await screen.findByText(/Password must be at least 6 characters long/i)
    expect(errorMsg).toBeInTheDocument()
  })
})
