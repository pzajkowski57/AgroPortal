import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoivodeshipSelect } from '../VoivodeshipSelect'
import { renderWithProviders } from '@/test/helpers'

describe('VoivodeshipSelect', () => {
  it('renders the trigger with default placeholder', () => {
    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} />,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Wybierz województwo')).toBeInTheDocument()
  })

  it('renders with a custom placeholder', () => {
    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} placeholder="Wybierz region" />,
    )

    expect(screen.getByText('Wybierz region')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} />,
    )

    expect(screen.getByRole('combobox', { name: 'Wybierz województwo' })).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is passed', () => {
    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} disabled />,
    )

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('calls onChange with an empty string when "Wszystkie województwa" is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    renderWithProviders(
      <VoivodeshipSelect onChange={handleChange} value="14" />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Wszystkie województwa'))

    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('calls onChange with voivodeship code when a voivodeship is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    renderWithProviders(
      <VoivodeshipSelect onChange={handleChange} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Mazowieckie'))

    expect(handleChange).toHaveBeenCalledWith('14')
  })

  it('displays the correct selected voivodeship name when a value is provided', () => {
    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} value="22" />,
    )

    expect(screen.getByText('Pomorskie')).toBeInTheDocument()
  })

  it('shows all 16 voivodeships plus the "all" option in the dropdown', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <VoivodeshipSelect onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('combobox'))

    // 16 voivodeships + 1 "all" option
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(17)
  })
})
