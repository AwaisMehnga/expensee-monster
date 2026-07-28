import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Settings2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Eyebrow,
  LoadingSpinner,
  MicButton,
  MonsterMascot,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../../components/ui'
import { useBudgetsStore, useSettingsStore } from '../../store'
import { analytics } from '../../services'
import { formatCents } from '../../lib/format'
import { daysRemaining, periodWindow } from '../../lib/dates'

export default function HomeScreen() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const weekStart = useSettingsStore((s) => s.settings?.weekStart)
  const budgets = useBudgetsStore((s) => s.budgets)
  const loading = useBudgetsStore((s) => s.loading)
  const load = useBudgetsStore((s) => s.load)

  const [monthSpent, setMonthSpent] = useState(0)

  useEffect(() => {
    void load(weekStart)
  }, [load, weekStart])

  const monthWin = useMemo(() => periodWindow('month', new Date()), [])
  useEffect(() => {
    let cancelled = false
    analytics.totalSpent({ from: monthWin.start, to: monthWin.end }).then((t) => {
      if (!cancelled) setMonthSpent(t)
    })
    return () => {
      cancelled = true
    }
  }, [monthWin, budgets])

  // Sum of this month's per-category budgets.
  const totalBudget = useMemo(
    () =>
      budgets
        .filter((b) => b.period_type === 'month' && b.category_id != null)
        .reduce((sum, b) => sum + b.amount_cents, 0),
    [budgets],
  )

  const hasBudget = totalBudget > 0
  const leftover = totalBudget - monthSpent
  const remaining = daysRemaining(monthWin.end)
  const perDay = remaining > 0 ? Math.floor(leftover / remaining) : leftover
  const pct = hasBudget ? Math.min(100, Math.round((monthSpent / totalBudget) * 100)) : 0

  return (
    <Screen>
      <ScreenHeader
        action={
          <Link
            to="/settings"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
            aria-label="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </Link>
        }
      />

      {/* Monster + mic hero */}
      <section className="flex flex-col items-center pt-8 text-center">
        <MonsterMascot state="listening" message="Tap and tell me what you spent." size="lg" />
        <div className="pt-8">
          <MicButton size="xl" isRecording={false} />
        </div>
      </section>

      {/* Budget summary */}
      <section className="pt-10">
        {loading && budgets.length === 0 ? (
          <LoadingSpinner />
        ) : !hasBudget ? (
          <Link
            to="/wallet"
            className="flex items-center gap-3 rounded-2xl border border-border-default p-4 transition-colors hover:bg-primary-50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-text-primary">Set a budget</span>
              <span className="block text-xs text-text-muted">Track what's left to spend this month.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
          </Link>
        ) : (
          <>
            <Eyebrow>Left to spend this month</Eyebrow>
            <p
              className={`mt-2 text-5xl font-extrabold tracking-tight tabular-nums ${
                leftover < 0 ? 'text-status-danger' : ''
              }`}
            >
              {formatCents(leftover, currency)}
            </p>

            <div className="mt-5">
              <ProgressBar
                value={pct}
                label="Spent this month"
                sublabel={formatCents(totalBudget, currency)}
                color={pct >= 100 ? 'danger' : 'primary'}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 divide-x divide-border-default border-y border-border-default">
              <div className="py-4 pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Spent</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatCents(monthSpent, currency)}</p>
              </div>
              <div className="py-4 pl-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Budget</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatCents(totalBudget, currency)}</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              <span className="font-semibold text-primary-600">
                ~{formatCents(perDay, currency)}/day
              </span>{' '}
              for the next {remaining} days
            </p>

            <Link
              to="/wallet"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border-default py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-primary-50 hover:text-text-primary"
            >
              Manage budgets <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </section>
    </Screen>
  )
}
