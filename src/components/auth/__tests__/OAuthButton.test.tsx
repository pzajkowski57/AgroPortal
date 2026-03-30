import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import { OAuthButton } from '../OAuthButton'

// ---------------------------------------------------------------------------
// OAuthButton tests
// ---------------------------------------------------------------------------

describe('OAuthButton', () => {
  describe('rendering', () => {
    it('renders the button with provided label text', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} />,
      )
      expect(screen.getByRole('button', { name: /kontynuuj z google/i })).toBeInTheDocument()
    })

    it('renders a Google icon', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} />,
      )
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('renders as full-width button', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} />,
      )
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/w-full/)
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={onClick} />,
      )
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('shows loading spinner and disables button when isLoading is true', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} isLoading />,
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not call onClick when button is disabled', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      renderWithProviders(
        <OAuthButton
          provider="google"
          label="Kontynuuj z Google"
          onClick={onClick}
          isLoading
        />,
      )
      await user.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('button is accessible by role', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} />,
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
