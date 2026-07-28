import { useEffect, useMemo, useState } from 'react'
import { Plus, Receipt, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Button,
  DatePicker,
  EmptyState,
  Eyebrow,
  Input,
  LoadingSpinner,
  Modal,
  ProgressBar,
  Screen,
  ScreenHeader,
  SearchBar,
  SegmentedControl,
  SelectMenu,
} from '../../components/ui'
import { formatCents } from '../../lib/format'
import { useCategoriesStore, useExpensesStore, useSettingsStore } from '../../store'

const periodOptions = [
  { value: 'all', label: 'All' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

// week/month/year → { from, to } ISO; 'all' clears the range.
function periodRange(period: string): { from?: string; to?: string } {
  if (period === 'all') return { from: undefined, to: undefined }
  const now = new Date()
  const from = new Date(now)
  if (period === 'week') from.setDate(now.getDate() - 7)
  else if (period === 'month') from.setMonth(now.getMonth() - 1)
  else if (period === 'year') from.setFullYear(now.getFullYear() - 1)
  return { from: from.toISOString(), to: now.toISOString() }
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function ExpensesScreen() {
  const load = useExpensesStore((s) => s.load)
  const loadCategories = useCategoriesStore((s) => s.load)
  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const items = useExpensesStore((s) => s.items)
  const total = useExpensesStore((s) => s.total)
  const byCategory = useExpensesStore((s) => s.byCategory)
  const trend = useExpensesStore((s) => s.trend)
  const filter = useExpensesStore((s) => s.filter)
  const loading = useExpensesStore((s) => s.loading)
  const setFilter = useExpensesStore((s) => s.setFilter)
  const addExpense = useExpensesStore((s) => s.add)
  const removeExpense = useExpensesStore((s) => s.remove)
  const categories = useCategoriesStore((s) => s.items)
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')

  const [period, setPeriod] = useState('month')

  // Add-expense modal state
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(null)

  const onPeriod = (value: string) => {
    setPeriod(value)
    setFilter(periodRange(value))
  }

  // Trend polyline over a 300x80 viewbox; hidden when <2 points.
  const points = useMemo(() => {
    if (trend.length < 2) return ''
    const values = trend.map((t) => t.total_cents)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min || 1
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 300
        const y = 72 - ((v - min) / span) * 64
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [trend])

  const maxCategory = Math.max(1, ...byCategory.map((c) => c.total_cents))

  const submit = async () => {
    if (!item.trim() || !amount) return
    await addExpense({
      item: item.trim(),
      amount_cents: Math.round(Number(amount) * 100),
      category_id: catId ? Number(catId) : undefined,
      spent_at: date ? date.toISOString() : undefined,
      source: 'manual',
    })
    setItem('')
    setAmount('')
    setCatId(null)
    setDate(null)
    setOpen(false)
  }

  return (
    <Screen>
      <ScreenHeader
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
            aria-label="Add expense"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      {/* Hero — total spent + period pills */}
      <section className="pt-8">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Spent this {period === 'all' ? 'period' : period}</Eyebrow>
          <SegmentedControl size="sm" options={periodOptions} value={period} onChange={onPeriod} />
        </div>
        <p className="mt-3 text-5xl font-extrabold tracking-tight tabular-nums">
          {formatCents(total, currency)}
        </p>

        {points && (
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
          </div>
        )}
      </section>

      {/* Search + category chips */}
      <section className="pt-10">
        <SearchBar
          value={filter.search ?? ''}
          onChange={(v) => setFilter({ search: v })}
          onClear={() => setFilter({ search: '' })}
          placeholder="Search expenses, places, items..."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter({ categoryId: undefined })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter.categoryId == null
                ? 'bg-primary-500 text-white'
                : 'border border-border-default text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const active = filter.categoryId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter({ categoryId: cat.id })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary-500 text-white'
                    : 'border border-border-default text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* Transaction list */}
      <section className="pt-10">
        <Eyebrow>Transactions</Eyebrow>
        {loading ? (
          <LoadingSpinner />
        ) : items.length ? (
          <ul className="mt-3 divide-y divide-border-default">
            {items.map((row) => (
              <li key={row.id} className="group flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
                  <Receipt className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">{row.item}</p>
                  {row.place && <p className="truncate text-xs text-text-muted">{row.place}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-text-primary">
                    {formatCents(row.amount_cents, currency)}
                  </p>
                  <p className="text-[11px] text-text-muted">{shortDate(row.spent_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeExpense(row.id)}
                  className="rounded-full p-1.5 text-text-muted opacity-0 transition-opacity hover:text-status-danger group-hover:opacity-100"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No expenses yet" description="Add one with the + button above." />
        )}
      </section>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <section className="pt-10">
          <Eyebrow>Where it went</Eyebrow>
          <div className="mt-4 space-y-4">
            {byCategory.map((c) => (
              <ProgressBar
                key={c.category_id ?? 'none'}
                value={c.total_cents}
                max={maxCategory}
                label={c.category_name ?? 'Uncategorized'}
                sublabel={formatCents(c.total_cents, currency)}
                color="primary"
              />
            ))}
          </div>
        </section>
      )}

      <Link
        to="/insights"
        className="mt-8 inline-flex text-sm font-semibold text-text-muted transition-colors hover:text-text-primary"
      >
        See full breakdown in Insights
      </Link>

      {/* Add expense */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add expense"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void submit()} disabled={!item.trim() || !amount}>
              Add
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Flat white" />
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Category</label>
            <SelectMenu
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              value={catId}
              onChange={setCatId}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">Date</label>
            <DatePicker value={date} onChange={setDate} placeholder="Optional (defaults to now)" />
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
