import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  BottomSheet,
  Button,
  Eyebrow,
  Input,
  LoadingSpinner,
  ProgressBar,
  SegmentedControl,
} from '../../components/ui'
import { useBudgetsStore, useCategoriesStore, useSettingsStore } from '../../store'
import { analytics, type Budget, type Category } from '../../services'
import { formatCents } from '../../lib/format'
import { periodWindow, toISODate } from '../../lib/dates'
import { toCents } from './shared'
import { AddCategorySheet } from './add-category-sheet'

type Period = 'day' | 'week' | 'month'

const PERIOD_TABS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function BudgetsTab() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const weekStart = useSettingsStore((s) => s.settings?.weekStart)
  const weekStartsOn: 0 | 1 = weekStart === 'sun' ? 0 : 1

  const budgets = useBudgetsStore((s) => s.budgets)
  const load = useBudgetsStore((s) => s.load)
  const create = useBudgetsStore((s) => s.create)
  const update = useBudgetsStore((s) => s.update)
  const remove = useBudgetsStore((s) => s.remove)
  const categories = useCategoriesStore((s) => s.items)
  const categoriesLoading = useCategoriesStore((s) => s.loading)
  const loadCategories = useCategoriesStore((s) => s.load)

  const [period, setPeriod] = useState<Period>('month')
  const [ref, setRef] = useState(() => new Date())
  const [spendMap, setSpendMap] = useState<Record<number, number>>({})
  const [totalSpent, setTotalSpent] = useState(0)

  // Sheets
  const [sheetCat, setSheetCat] = useState<Category | null>(null)
  const [amountInput, setAmountInput] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  useEffect(() => {
    void load(weekStart)
  }, [load, weekStart])
  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const win = useMemo(
    () => periodWindow(period, ref, { weekStartsOn }),
    [period, ref, weekStartsOn],
  )

  // Spend for the active window.
  useEffect(() => {
    let cancelled = false
    Promise.all([
      analytics.spendByCategory({ from: win.start, to: win.end }),
      analytics.totalSpent({ from: win.start, to: win.end }),
    ]).then(([byCat, total]) => {
      if (cancelled) return
      const map: Record<number, number> = {}
      for (const row of byCat) if (row.category_id != null) map[row.category_id] = row.total_cents
      setSpendMap(map)
      setTotalSpent(total)
    })
    return () => {
      cancelled = true
    }
  }, [win, budgets])

  // Budgets for the selected period → category_id → budget
  const budgetByCat = useMemo(() => {
    const m = new Map<number, Budget>()
    for (const b of budgets) if (b.period_type === period && b.category_id != null) m.set(b.category_id, b)
    return m
  }, [budgets, period])

  const totalBudget = useMemo(
    () => [...budgetByCat.values()].reduce((sum, b) => sum + b.amount_cents, 0),
    [budgetByCat],
  )

  const budgeted = categories.filter((c) => budgetByCat.has(c.id))
  const notBudgeted = categories.filter((c) => !budgetByCat.has(c.id))

  const label =
    period === 'month'
      ? ref.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : period === 'week'
      ? `${shortDate(win.start)} – ${shortDate(win.end)}`
      : ref.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const shift = (delta: number) => {
    setRef((d) =>
      period === 'month'
        ? new Date(d.getFullYear(), d.getMonth() + delta, 1)
        : addDays(d, delta * (period === 'week' ? 7 : 1)),
    )
  }

  const openSheet = (c: Category) => {
    const existing = budgetByCat.get(c.id)
    setSheetCat(c)
    setAmountInput(existing ? String(existing.amount_cents / 100) : '')
  }
  const closeSheet = () => setSheetCat(null)
  const existingBudget = sheetCat ? budgetByCat.get(sheetCat.id) : undefined

  const saveBudget = async () => {
    if (!sheetCat || toCents(amountInput) <= 0) return
    if (existingBudget) await update(existingBudget.id, { amount_cents: toCents(amountInput) })
    else
      await create({
        amount_cents: toCents(amountInput),
        period_type: period,
        category_id: sheetCat.id,
        start_date: toISODate(ref),
      })
    closeSheet()
  }
  const removeBudget = async () => {
    if (existingBudget) await remove(existingBudget.id)
    closeSheet()
  }

  const CategoryIcon = ({ icon }: { icon: string | null }) => (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-lg">
      {icon ?? '🏷️'}
    </span>
  )

  return (
    <div>
      {/* Period toggle */}
      <SegmentedControl
        fullWidth
        options={PERIOD_TABS}
        value={period}
        onChange={(v) => setPeriod(v as Period)}
      />

      {/* Navigator */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-lg font-bold tracking-tight">{label}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Totals */}
      <div className="mt-5 grid grid-cols-2 divide-x divide-border-default border-y border-border-default">
        <div className="py-4 pr-4">
          <Eyebrow>Total budget</Eyebrow>
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatCents(totalBudget, currency)}</p>
        </div>
        <div className="py-4 pl-4">
          <Eyebrow>Total spent</Eyebrow>
          <p
            className={`mt-1 text-2xl font-extrabold tabular-nums ${
              totalBudget > 0 && totalSpent > totalBudget ? 'text-status-danger' : 'text-primary-600'
            }`}
          >
            {formatCents(totalSpent, currency)}
          </p>
        </div>
      </div>

      {categoriesLoading && categories.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Budgeted */}
          <section className="pt-8">
            <Eyebrow>Budgeted this {period}</Eyebrow>
            {budgeted.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">
                No budgets set for this {period}. Tap “Set budget” on a category below.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-border-default">
                {budgeted.map((c) => {
                  const b = budgetByCat.get(c.id)!
                  const spent = spendMap[c.id] ?? 0
                  const pct = Math.min(100, Math.round((spent / b.amount_cents) * 100))
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openSheet(c)}
                      className="w-full py-4 text-left transition-colors hover:bg-primary-50/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <CategoryIcon icon={c.icon} />
                          <p className="truncate font-semibold text-text-primary">{c.name}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums">
                          {formatCents(spent, currency)}{' '}
                          <span className="font-medium text-text-muted">
                            / {formatCents(b.amount_cents, currency)}
                          </span>
                        </p>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={pct} color={pct >= 100 ? 'danger' : 'primary'} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Not budgeted */}
          {notBudgeted.length > 0 && (
            <section className="pt-8">
              <Eyebrow>Not budgeted this {period}</Eyebrow>
              <div className="mt-3 divide-y divide-border-default">
                {notBudgeted.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon icon={c.icon} />
                      <p className="truncate font-semibold text-text-primary">{c.name}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => openSheet(c)}>
                      Set budget
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Add a custom category (budget type) */}
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong py-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            <Plus className="h-4 w-4" /> New category
          </button>
        </>
      )}

      {/* Set / edit budget sheet */}
      <BottomSheet
        isOpen={!!sheetCat}
        onClose={closeSheet}
        title={sheetCat ? `${sheetCat.icon ?? '🏷️'}  ${sheetCat.name} · ${period}` : ''}
      >
        <div className="space-y-3">
          <Input
            label={`Limit per ${period}`}
            type="number"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0.00"
          />
          <Button variant="primary" fullWidth onClick={saveBudget} disabled={toCents(amountInput) <= 0}>
            {existingBudget ? 'Update budget' : 'Set budget'}
          </Button>
          {existingBudget && (
            <Button variant="ghost" fullWidth onClick={removeBudget} className="text-status-danger">
              Remove budget
            </Button>
          )}
        </div>
      </BottomSheet>

      <AddCategorySheet
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onCreated={(c) => openSheet(c)}
      />
    </div>
  )
}
