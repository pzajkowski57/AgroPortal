'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PriceRangeInputProps {
  priceMin: string
  priceMax: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}

export function PriceRangeInput({
  priceMin,
  priceMax,
  onMinChange,
  onMaxChange,
}: PriceRangeInputProps): React.ReactElement {
  const [localMin, setLocalMin] = useState(priceMin)
  const [localMax, setLocalMax] = useState(priceMax)
  const [error, setError] = useState<string | null>(null)

  function handleMinBlur() {
    const min = Number(localMin)
    const max = Number(localMax)

    if (localMin && localMax && !isNaN(min) && !isNaN(max) && min > max) {
      setError('Cena minimalna nie może być większa niż maksymalna')
      return
    }

    setError(null)
    onMinChange(localMin)
  }

  function handleMaxBlur() {
    const min = Number(localMin)
    const max = Number(localMax)

    if (localMin && localMax && !isNaN(min) && !isNaN(max) && min > max) {
      setError('Cena minimalna nie może być większa niż maksymalna')
      return
    }

    setError(null)
    onMaxChange(localMax)
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">Cena (PLN)</p>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="price-min" className="sr-only">
            Cena od
          </Label>
          <Input
            id="price-min"
            type="number"
            min={0}
            placeholder="Od"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={handleMinBlur}
            className="h-9 text-sm"
            aria-label="Cena minimalna"
          />
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">—</span>
        <div className="flex-1">
          <Label htmlFor="price-max" className="sr-only">
            Cena do
          </Label>
          <Input
            id="price-max"
            type="number"
            min={0}
            placeholder="Do"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={handleMaxBlur}
            className="h-9 text-sm"
            aria-label="Cena maksymalna"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
