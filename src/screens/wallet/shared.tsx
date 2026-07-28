import type { ReactNode } from 'react'
import { Plus, X } from 'lucide-react'

/** Dollars string → integer cents. */
export const toCents = (v: string) => Math.round(Number(v || 0) * 100)

/** Inline reveal — a "+ Add" toggle with a hairline form panel (no modal). */
export function AddSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
      >
        {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {open ? 'Close' : label}
      </button>
      {open && (
        <div className="mt-3 space-y-3 rounded-2xl border border-border-default p-4">{children}</div>
      )}
    </div>
  )
}

/** Single-select pill chips (used instead of dropdowns for quick tap-to-pick). */
export function Chips({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string }[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onSelect(o.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === o.value
              ? 'bg-primary-500 text-white'
              : 'border border-border-default text-text-secondary hover:text-text-primary'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
