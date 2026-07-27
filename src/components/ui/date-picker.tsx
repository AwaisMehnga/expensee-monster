import React, { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export interface QuickDateFilterProps {
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
}

export const QuickDateFilter: React.FC<QuickDateFilterProps> = ({
  selectedPeriod,
  onSelectPeriod,
}) => {
  const periods = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ]

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
      <Calendar className="w-4 h-4 text-text-muted shrink-0 mr-1" />
      {periods.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelectPeriod(p.id)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            selectedPeriod === p.id
              ? 'bg-primary-500 text-white'
              : 'bg-surface-raised text-text-secondary hover:text-text-primary border border-border-default'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

/* ── Calendar date picker ─────────────────────────────────────────────── */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatDate = (d: Date) =>
  `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`

export interface DatePickerProps {
  value: Date | null
  onChange: (date: Date) => void
  min?: Date
  max?: Date
  placeholder?: string
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => value ?? new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const isDisabled = (d: Date) =>
    (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) ||
    (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate()))

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-2xl border border-border-default bg-surface-raised px-4 py-3 text-left text-sm font-semibold text-text-primary transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      >
        <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
        <span className={value ? '' : 'text-text-muted font-normal'}>
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 animate-scale-up rounded-2xl border border-border-default bg-surface-raised p-3 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-primary-50 hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-text-primary">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-primary-50 hover:text-text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="py-1 text-center text-[11px] font-semibold text-text-muted">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={i} />
              const date = new Date(year, month, day)
              const disabled = isDisabled(date)
              const selected = value && sameDay(date, value)
              const isToday = sameDay(date, today)
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(date)
                    setOpen(false)
                  }}
                  className={`flex h-9 items-center justify-center rounded-full text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    selected
                      ? 'bg-primary-500 text-white'
                      : isToday
                      ? 'text-primary-600 ring-1 ring-inset ring-primary-300'
                      : 'text-text-primary hover:bg-primary-50'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
