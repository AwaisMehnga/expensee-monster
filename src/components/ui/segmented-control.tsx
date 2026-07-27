import React from 'react'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
}: SegmentedControlProps<T>) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-full border border-border-default bg-surface-overlay p-1 ${
        fullWidth ? 'flex w-full' : ''
      } ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors ${pad} ${
              fullWidth ? 'flex-1' : ''
            } ${
              active
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-primary-50'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
