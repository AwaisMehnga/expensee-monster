import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Eyebrow,
  ProgressBar,
  Screen,
  ScreenHeader,
  SearchBar,
  SegmentedControl,
} from '../../components/ui'
import { formatAmount, formatMoney } from '../../lib/format'

type ExpenseRow = {
  id: string
  emoji: string
  name: string
  merchant: string
  category: string
  amount: number
  time: string
}

const expenseRows: ExpenseRow[] = [
  { id: '1', emoji: '☕', name: 'Flat white', merchant: 'Corner Cafe', category: 'Food', amount: 4.8, time: 'Today · 8:12 AM' },
  { id: '2', emoji: '🛒', name: 'Weekly shop', merchant: 'Metro Market', category: 'Groceries', amount: 18.4, time: 'Today · 11:05 AM' },
  { id: '3', emoji: '🚕', name: 'Ride home', merchant: 'Uber', category: 'Transport', amount: 12.1, time: 'Yesterday · 6:40 PM' },
  { id: '4', emoji: '💿', name: 'Paperless Pro', merchant: 'Subscription', category: 'Software', amount: 9.0, time: 'Mon · Monthly' },
  { id: '5', emoji: '🍜', name: 'Ramen night', merchant: 'Ippudo', category: 'Food', amount: 21.5, time: 'Sun · 7:20 PM' },
  { id: '6', emoji: '🎬', name: 'Movie tickets', merchant: 'Odeon', category: 'Fun', amount: 15.0, time: 'Sat · 8:00 PM' },
]

const categories = ['All', 'Food', 'Groceries', 'Transport', 'Software', 'Fun']

// Simple monthly totals for the trend line (mock).
const trend = [320, 280, 410, 360, 300, 344]
const trendMonths = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

const periodOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export default function ExpensesScreen() {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('month')
  const [category, setCategory] = useState('All')

  const visibleRows = useMemo(() => {
    const q = query.toLowerCase()
    return expenseRows.filter((row) => {
      const matchesCat = category === 'All' || row.category === category
      const matchesQuery = `${row.name} ${row.merchant} ${row.category}`.toLowerCase().includes(q)
      return matchesCat && matchesQuery
    })
  }, [query, category])

  const total = useMemo(() => visibleRows.reduce((sum, r) => sum + r.amount, 0), [visibleRows])

  // Build the single-stroke trend polyline over a 300x80 viewbox.
  const points = useMemo(() => {
    const max = Math.max(...trend)
    const min = Math.min(...trend)
    const span = max - min || 1
    return trend
      .map((v, i) => {
        const x = (i / (trend.length - 1)) * 300
        const y = 72 - ((v - min) / span) * 64
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [])

  return (
    <Screen>
      {/* Header */}
      <ScreenHeader
        action={
          <button
            type="button"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
            aria-label="Filter expenses"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        }
      />

      {/* Hero — total spent + period pills */}
      <section className="pt-8">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Spent this {period}</Eyebrow>
          <SegmentedControl
            size="sm"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
        </div>
        <p className="mt-3 text-5xl font-extrabold tracking-tight tabular-nums">
          <span className="text-primary-600">$</span>
          {formatAmount(total)}
        </p>

        {/* Single-stroke trend line */}
        <div className="mt-6">
          <svg viewBox="0 0 300 80" className="h-20 w-full" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke="var(--primary-500)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-text-muted">
            {trendMonths.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Search + category chips */}
      <section className="pt-10">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search expenses, merchants, categories..."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat === category
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary-500 text-white'
                    : 'border border-border-default text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* Transaction list — hairline rows */}
      <section className="pt-10">
        <Eyebrow>Transactions</Eyebrow>
        {visibleRows.length ? (
          <ul className="mt-3 divide-y divide-border-default">
            {visibleRows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-lg">
                  {row.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">{row.name}</p>
                  <p className="truncate text-xs text-text-muted">{row.merchant}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-text-primary">{formatMoney(row.amount)}</p>
                  <p className="text-[11px] text-text-muted">{row.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-text-muted">No expenses match your filters.</p>
        )}
      </section>

      {/* Category breakdown */}
      <section className="pt-10">
        <Eyebrow>Where it went</Eyebrow>
        <div className="mt-4 space-y-4">
          <ProgressBar value={72} label="Food & dining" sublabel="$32.80" color="primary" />
          <ProgressBar value={44} label="Groceries" sublabel="$18.40" color="primary" />
          <ProgressBar value={30} label="Transport" sublabel="$12.10" color="primary" />
          <ProgressBar value={22} label="Software" sublabel="$9.00" color="primary" />
        </div>
      </section>

      <Link
        to="/insights"
        className="mt-8 inline-flex text-sm font-semibold text-text-muted transition-colors hover:text-text-primary"
      >
        See full breakdown in Insights
      </Link>
    </Screen>
  )
}
