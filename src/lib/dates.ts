import type { PeriodType } from '../db/types'

/** Local date as YYYY-MM-DD. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISODate(): string {
  return toISODate(new Date())
}

export function nowISO(): string {
  return new Date().toISOString()
}

export interface DateWindow {
  start: string // YYYY-MM-DD, inclusive
  end: string // YYYY-MM-DD, inclusive
}

/** The concrete date range for a budget period, relative to `ref` (default today). */
export function periodWindow(
  period: PeriodType,
  ref: Date = new Date(),
  opts: { weekStartsOn?: 0 | 1; startDate?: string; endDate?: string | null } = {},
): DateWindow {
  const weekStartsOn = opts.weekStartsOn ?? 1
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())

  switch (period) {
    case 'day':
      return { start: toISODate(d), end: toISODate(d) }
    case 'week': {
      const diff = (d.getDay() - weekStartsOn + 7) % 7
      const start = new Date(d)
      start.setDate(d.getDate() - diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return { start: toISODate(start), end: toISODate(end) }
    }
    case 'month':
      return {
        start: toISODate(new Date(d.getFullYear(), d.getMonth(), 1)),
        end: toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
      }
    case 'year':
      return {
        start: toISODate(new Date(d.getFullYear(), 0, 1)),
        end: toISODate(new Date(d.getFullYear(), 11, 31)),
      }
    case 'custom':
      return { start: opts.startDate ?? toISODate(d), end: opts.endDate ?? toISODate(d) }
  }
}

/** Whole days from start..end inclusive (>= 1). */
export function daysInclusive(startISO: string, endISO: string): number {
  const s = new Date(`${startISO}T00:00:00`).getTime()
  const e = new Date(`${endISO}T00:00:00`).getTime()
  return Math.max(1, Math.floor((e - s) / 86_400_000) + 1)
}

/** Days remaining from today to end (0 if past). */
export function daysRemaining(endISO: string): number {
  const today = new Date(`${todayISODate()}T00:00:00`).getTime()
  const end = new Date(`${endISO}T00:00:00`).getTime()
  return Math.max(0, Math.floor((end - today) / 86_400_000) + 1)
}
