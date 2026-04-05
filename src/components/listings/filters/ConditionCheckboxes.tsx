'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { ListingCondition } from '@/types'

interface ConditionOption {
  value: ListingCondition
  label: string
}

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: 'new', label: 'Nowy' },
  { value: 'used', label: 'Używany' },
  { value: 'for_parts', label: 'Na części' },
]

interface ConditionCheckboxesProps {
  value: ListingCondition[]
  onChange: (value: ListingCondition[]) => void
}

export function ConditionCheckboxes({
  value,
  onChange,
}: ConditionCheckboxesProps): React.ReactElement {
  function handleChange(condition: ListingCondition, checked: boolean) {
    if (checked) {
      onChange([...value, condition])
    } else {
      onChange(value.filter((c) => c !== condition))
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">Stan</p>
      <ul className="space-y-1">
        {CONDITION_OPTIONS.map(({ value: condVal, label }) => {
          const isChecked = value.includes(condVal)
          const id = `condition-${condVal}`

          return (
            <li key={condVal}>
              <label
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted min-h-[44px]',
                  isChecked ? 'text-agro-700 font-medium' : 'text-foreground',
                )}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-agro-600 focus:ring-agro-500"
                  checked={isChecked}
                  onChange={(e) => handleChange(condVal, e.target.checked)}
                />
                {label}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
