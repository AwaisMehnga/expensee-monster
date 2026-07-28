import { useEffect } from 'react'
import { ArrowRight, Settings2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Button,
  Eyebrow,
  LoadingSpinner,
  MicButton,
  MonsterMascot,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../../components/ui'
import { useBudgetsStore, useSettingsStore } from '../../store'
import { formatCents } from '../../lib/format'

export default function HomeScreen() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const weekStart = useSettingsStore((s) => s.settings?.weekStart)
  const statuses = useBudgetsStore((s) => s.statuses)
  const loading = useBudgetsStore((s) => s.loading)
  const load = useBudgetsStore((s) => s.load)

  useEffect(() => {
    void load(weekStart)
  }, [load, weekStart])

  const status = statuses.find((s) => s.budget.category_id === null) ?? statuses[0]

  return (
    <Screen>
      {/* Header */}
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

      {/* Budget summary — one hero number, hairline stats */}
      <section className="pt-10">
        {loading && !status ? (
          <LoadingSpinner />
        ) : !status ? (
          <Link
            to="/wallet"
            className="flex items-center gap-3 rounded-2xl border border-border-default p-4 transition-colors hover:bg-primary-50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-text-primary">Set a budget</span>
              <span className="block text-xs text-text-muted">
                Track what's left to spend each day.
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
          </Link>
        ) : (
          <>
            <Eyebrow>Left to spend</Eyebrow>
            <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
              {formatCents(status.leftover_cents, currency)}
            </p>

            <div className="mt-5">
              <ProgressBar
                value={Math.min(
                  100,
                  Math.round((status.spent_cents / status.budget.amount_cents) * 100),
                )}
                label="Budget used"
                sublabel={formatCents(status.budget.amount_cents, currency)}
                color="primary"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 divide-x divide-border-default border-y border-border-default">
              <div className="py-4 pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Spent</p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {formatCents(status.spent_cents, currency)}
                </p>
              </div>
              <div className="py-4 pl-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Budget</p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {formatCents(status.budget.amount_cents, currency)}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              <span className="font-semibold text-primary-600">
                ~{formatCents(status.per_day_left_cents, currency)}/day
              </span>{' '}
              for {status.days_remaining} days
            </p>

            <Button
              variant="outline"
              fullWidth
              className="mt-6"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              See this week
            </Button>
          </>
        )}
      </section>
    </Screen>
  )
}
