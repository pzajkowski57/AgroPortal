import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVoivodeshipOptions } from '@/lib/utils/voivodeships'

const ALL_OPTION_VALUE = '__all__' as const

interface VoivodeshipSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function VoivodeshipSelect({
  value,
  onChange,
  placeholder = 'Wybierz województwo',
  disabled = false,
  className,
}: VoivodeshipSelectProps) {
  const options = getVoivodeshipOptions()

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label
    : undefined

  function handleValueChange(selected: string) {
    onChange(selected === ALL_OPTION_VALUE ? '' : selected)
  }

  return (
    <SelectPrimitive.Root
      value={value || ALL_OPTION_VALUE}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={placeholder}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedLabel ?? placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            <SelectPrimitive.Item
              value={ALL_OPTION_VALUE}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Check className="h-4 w-4" />
              </SelectPrimitive.ItemIndicator>
              <SelectPrimitive.ItemText>Wszystkie województwa</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>

            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
