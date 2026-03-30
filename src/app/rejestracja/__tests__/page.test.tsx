import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'

// ---------------------------------------------------------------------------
// Mock server action
// ---------------------------------------------------------------------------

vi.mock('../actions', () => ({
  registerAction: vi.fn().mockResolvedValue({}),
}))

// ---------------------------------------------------------------------------
// Import page after mocks
// ---------------------------------------------------------------------------

import RejestracjaPage from '../page'
import { registerAction } from '../actions'

const mockRegisterAction = vi.mocked(registerAction)

describe('RejestracjaPage', () => {
  beforeEach(() => {
    mockRegisterAction.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('renders the AgroPortal brand', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByText('AgroPortal')).toBeInTheDocument()
    })

    it('renders h1 "Utwórz konto"', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('heading', { name: /utwórz konto/i })).toBeInTheDocument()
    })

    it('renders the Google OAuth button', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('button', { name: /kontynuuj z google/i })).toBeInTheDocument()
    })

    it('renders "lub" divider text', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByText(/lub/i)).toBeInTheDocument()
    })

    it('renders Imię field', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByLabelText(/imię/i)).toBeInTheDocument()
    })

    it('renders E-mail field', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    it('renders Hasło field', () => {
      renderWithProviders(<RejestracjaPage />)
      // There are two password fields — get all and check at least one
      const passwordLabels = screen.getAllByLabelText(/hasło/i)
      expect(passwordLabels.length).toBeGreaterThanOrEqual(1)
    })

    it('renders Powtórz hasło field', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByLabelText(/powtórz hasło/i)).toBeInTheDocument()
    })

    it('renders a terms checkbox', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders the submit button "Zarejestruj się"', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('button', { name: /zarejestruj się/i })).toBeInTheDocument()
    })

    it('submit button is disabled when terms are not accepted', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('button', { name: /zarejestruj się/i })).toBeDisabled()
    })

    it('renders a link back to /logowanie', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.getByRole('link', { name: /zaloguj się/i })).toHaveAttribute('href', '/logowanie')
    })
  })

  describe('terms checkbox behaviour', () => {
    it('enables the submit button once terms are accepted', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RejestracjaPage />)

      const submitBtn = screen.getByRole('button', { name: /zarejestruj się/i })
      expect(submitBtn).toBeDisabled()

      await user.click(screen.getByRole('checkbox'))
      expect(submitBtn).toBeEnabled()
    })

    it('disables the submit button again when terms are unchecked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RejestracjaPage />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      await user.click(checkbox)
      expect(screen.getByRole('button', { name: /zarejestruj się/i })).toBeDisabled()
    })
  })

  describe('password strength indicator', () => {
    it('shows strength indicator when user types in the password field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RejestracjaPage />)

      // Get the first password field (Hasło, not Powtórz hasło)
      const passwordInputs = screen.getAllByLabelText(/hasło/i)
      await user.type(passwordInputs[0], 'Password1')

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('shows an error when action returns an error', async () => {
      mockRegisterAction.mockResolvedValue({ error: 'Konto z tym adresem e-mail już istnieje' })
      const user = userEvent.setup()

      renderWithProviders(<RejestracjaPage />)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /zarejestruj się/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Konto z tym adresem e-mail już istnieje',
        )
      })
    })

    it('does not show an error alert on initial render', () => {
      renderWithProviders(<RejestracjaPage />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
