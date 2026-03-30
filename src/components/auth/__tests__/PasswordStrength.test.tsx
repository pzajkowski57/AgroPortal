import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { PasswordStrength } from '../PasswordStrength'

// ---------------------------------------------------------------------------
// PasswordStrength tests
// ---------------------------------------------------------------------------

describe('PasswordStrength', () => {
  describe('rendering', () => {
    it('renders nothing when password is empty', () => {
      const { container } = renderWithProviders(<PasswordStrength password="" />)
      expect(container.firstChild).toBeNull()
    })

    it('renders an indicator when password is provided', () => {
      renderWithProviders(<PasswordStrength password="abc" />)
      // The component renders some indicator element
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('strength levels', () => {
    it('shows "Słabe" label for a very weak password', () => {
      renderWithProviders(<PasswordStrength password="abc" />)
      expect(screen.getByText(/słabe/i)).toBeInTheDocument()
    })

    it('shows "Średnie" label for a medium password (8 chars, no uppercase/number)', () => {
      renderWithProviders(<PasswordStrength password="abcdefgh" />)
      expect(screen.getByText(/średnie/i)).toBeInTheDocument()
    })

    it('shows "Mocne" label for a strong password (8+ chars, uppercase, number)', () => {
      renderWithProviders(<PasswordStrength password="Password1" />)
      expect(screen.getByText(/mocne/i)).toBeInTheDocument()
    })

    it('shows "Bardzo mocne" label for an extra-strong password (12+ chars, uppercase, number, special)', () => {
      renderWithProviders(<PasswordStrength password="Password1!long" />)
      expect(screen.getByText(/bardzo mocne/i)).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles a single character password', () => {
      renderWithProviders(<PasswordStrength password="A" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles a password with only numbers', () => {
      renderWithProviders(<PasswordStrength password="12345678" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles a very long password', () => {
      renderWithProviders(<PasswordStrength password={'A1!' + 'x'.repeat(50)} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles special characters and unicode', () => {
      renderWithProviders(<PasswordStrength password="Pässwörd1!" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
