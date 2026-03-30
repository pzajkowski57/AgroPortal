import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import { PasswordInput } from '../PasswordInput'

// ---------------------------------------------------------------------------
// PasswordInput tests
// ---------------------------------------------------------------------------

describe('PasswordInput', () => {
  describe('rendering', () => {
    it('renders an input of type password by default', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'password')
    })

    it('renders the provided label text', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
    })

    it('renders a toggle button for show/hide', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders an error message when error prop is provided', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" error="Pole wymagane" />)
      expect(screen.getByText('Pole wymagane')).toBeInTheDocument()
    })

    it('does not render an error message when error prop is absent', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('show/hide toggle', () => {
    it('switches input to type text when toggle is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      await user.click(screen.getByRole('button'))
      expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'text')
    })

    it('switches back to type password when toggle is clicked again', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      const toggle = screen.getByRole('button')
      await user.click(toggle)
      await user.click(toggle)
      expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'password')
    })
  })

  describe('controlled input', () => {
    it('forwards onChange to the underlying input', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" onChange={onChange} />)
      await user.type(screen.getByLabelText('Hasło'), 'abc')
      expect(onChange).toHaveBeenCalled()
    })

    it('renders with a provided value', () => {
      renderWithProviders(
        <PasswordInput id="pwd" label="Hasło" value="secret" onChange={vi.fn()} />,
      )
      expect(screen.getByLabelText('Hasło')).toHaveValue('secret')
    })
  })

  describe('accessibility', () => {
    it('label is associated with the input via htmlFor/id', () => {
      renderWithProviders(<PasswordInput id="my-password" label="Hasło" />)
      const input = screen.getByLabelText('Hasło')
      expect(input).toHaveAttribute('id', 'my-password')
    })

    it('toggle button has an accessible label', () => {
      renderWithProviders(<PasswordInput id="pwd" label="Hasło" />)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAccessibleName()
    })
  })
})
