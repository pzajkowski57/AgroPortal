import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'

// ---------------------------------------------------------------------------
// Mock server action
// ---------------------------------------------------------------------------

vi.mock('../actions', () => ({
  loginAction: vi.fn().mockResolvedValue({}),
}))

// ---------------------------------------------------------------------------
// Import page after mocks
// ---------------------------------------------------------------------------

import LogowaniePage from '../page'
import { loginAction } from '../actions'

const mockLoginAction = vi.mocked(loginAction)

describe('LogowaniePage', () => {
  beforeEach(() => {
    mockLoginAction.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the AgroPortal brand', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByText('AgroPortal')).toBeInTheDocument()
    })

    it('renders h1 "Zaloguj się"', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByRole('heading', { name: /zaloguj się/i })).toBeInTheDocument()
    })

    it('renders the Google OAuth button', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByRole('button', { name: /kontynuuj z google/i })).toBeInTheDocument()
    })

    it('renders "lub" divider text', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByText(/lub/i)).toBeInTheDocument()
    })

    it('renders E-mail label and input', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    it('renders Hasło label and input', () => {
      renderWithProviders(<LogowaniePage />)
      // Use exact label text to avoid ambiguity with "Pokaż hasło" button
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
    })

    it('renders a submit button "Zaloguj się"', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByRole('button', { name: /^zaloguj się$/i })).toBeInTheDocument()
    })

    it('renders a link to /rejestracja', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByRole('link', { name: /zarejestruj się/i })).toHaveAttribute('href', '/rejestracja')
    })
  })

  describe('error display', () => {
    it('shows an error message when action returns an error', async () => {
      mockLoginAction.mockResolvedValue({ error: 'Nieprawidłowy e-mail lub hasło' })
      const user = userEvent.setup()

      renderWithProviders(<LogowaniePage />)

      await user.type(screen.getByLabelText(/e-mail/i), 'bad@example.com')
      await user.type(screen.getByLabelText('Hasło'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /^zaloguj się$/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Nieprawidłowy e-mail lub hasło')
      })
    })

    it('does not show an error alert on initial render', () => {
      renderWithProviders(<LogowaniePage />)
      expect(screen.getByRole('alert')).toHaveTextContent('')
    })
  })

  describe('password visibility toggle', () => {
    it('toggles the password input type on toggle button click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LogowaniePage />)

      const passwordInput = screen.getByLabelText('Hasło')
      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: /pokaż hasło/i }))
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })
})
