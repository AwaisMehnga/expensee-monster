import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Eyebrow,
  Input,
  LoadingSpinner,
  ProgressBar,
  SegmentedControl,
} from '../../components/ui'
import { useBudgetsStore, useCategoriesStore, useSettingsStore } from '../../store'
import { formatCents } from '../../lib/format'
import type { PeriodType } from '../../services'
import { AddSection, Chips, toCents } from './shared'

const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export default function BudgetsTab() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const weekStart = useSettingsStore((s) => s.settings?.weekStart)
  const statuses = useBudgetsStore((s) => s.statuses)
  const loading = useBudgetsStore((s) => s.loading)
  const load = useBudgetsStore((s) => s.load)
  const create = useBudgetsStore((s) => s.create)
  const remove = useBudgetsStore((s) => s.remove)
  const categories = useCategoriesStore((s) => s.items)
  const loadCategories = useCategoriesStore((s) => s.load)
  const addCategory = useCategoriesStore((s) => s.add)

  useEffect(() => {
    void load(weekStart)
  }, [load, weekStart])
  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<PeriodType>('month')
  const [categoryId, setCategoryId] = useState('') // '' = overall

  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('')

  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? 'Overall'

  const categoryChips = [
    { value: '', label: 'Overall' },
    ...categories.map((c) => ({ value: String(c.id), label: `${c.icon ? `${c.icon} ` : ''}${c.name}` })),
  ]

  const createNewCategory = async () => {
    if (!newCatName.trim()) return
    const cat = await addCategory(newCatName.trim(), newCatEmoji.trim() || null)
    setCategoryId(String(cat.id))
    setNewCatName('')
    setNewCatEmoji('')
    setShowNewCat(false)
  }

  const submit = async () => {
    if (toCents(amount) <= 0) return
    await create({
      amount_cents: toCents(amount),
      period_type: period,
      category_id: categoryId ? Number(categoryId) : null,
    })
    setAmount('')
    setPeriod('month')
    setCategoryId('')
    setShowAdd(false)
  }

  return (
    <div>
      <Eyebrow>Budgets</Eyebrow>
      <div className="pt-4">
        {loading && statuses.length === 0 ? (
          <LoadingSpinner />
        ) : statuses.length === 0 ? (
          <p className="rounded-2xl border border-border-default p-4 text-sm text-text-muted">
            No budgets yet — add one below to start pacing your spending.
          </p>
        ) : (
          <div className="space-y-6">
            {statuses.map((s) => {
              const pct = Math.min(100, Math.round((s.spent_cents / s.budget.amount_cents) * 100))
              return (
                <div key={s.budget.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-text-primary">{categoryName(s.budget.category_id)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs capitalize text-text-muted">{s.budget.period_type}</span>
                      <button
                        type="button"
                        onClick={() => remove(s.budget.id)}
                        className="rounded-lg p-1 text-text-muted hover:bg-primary-50 hover:text-status-danger"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={pct}
                      label={`${formatCents(s.spent_cents, currency)} of ${formatCents(s.budget.amount_cents, currency)}`}
                      color={pct >= 90 ? 'danger' : 'primary'}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddSection label="New budget" open={showAdd} onToggle={() => setShowAdd((o) => !o)}>
        <Input label="Amount" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-text-muted">Period</span>
          <SegmentedControl fullWidth options={PERIODS} value={period} onChange={(v) => setPeriod(v as PeriodType)} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-muted">Category — tap to pick</span>
          <Chips options={categoryChips} value={categoryId} onSelect={setCategoryId} />
          {showNewCat ? (
            <div className="flex items-end gap-2 pt-1">
              <div className="w-14 shrink-0">
                <Input value={newCatEmoji} onChange={(e) => setNewCatEmoji(e.target.value)} placeholder="🏷️" className="text-center" />
              </div>
              <div className="flex-1">
                <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New type" />
              </div>
              <Button variant="secondary" onClick={createNewCategory} disabled={!newCatName.trim()}>
                Add
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewCat(true)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4" /> New type
            </button>
          )}
        </div>

        <Button variant="primary" fullWidth onClick={submit} disabled={toCents(amount) <= 0}>
          Add budget
        </Button>
      </AddSection>
    </div>
  )
}
