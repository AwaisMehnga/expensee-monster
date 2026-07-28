import { useEffect } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  EmptyState,
  Eyebrow,
  LoadingSpinner,
  MonsterMascot,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../../components/ui'
import { formatCents } from '../../lib/format'
import { useExpensesStore, useSettingsStore } from '../../store'

export default function InsightsScreen() {
  const load = useExpensesStore((s) => s.load)
  useEffect(() => {
    void load()
  }, [load])

  const items = useExpensesStore((s) => s.items)
  const byCategory = useExpensesStore((s) => s.byCategory)
  const loading = useExpensesStore((s) => s.loading)
  const markUnnecessary = useExpensesStore((s) => s.markUnnecessary)
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')

  const unnecessaryTotal = items
    .filter((e) => e.is_unnecessary)
    .reduce((sum, e) => sum + e.amount_cents, 0)

  const topCategories = byCategory.slice(0, 4)
  const maxCategory = Math.max(1, ...topCategories.map((c) => c.total_cents))

  return (
    <Screen>
      <ScreenHeader
        title="Money Coach"
        action={
          <Badge variant="outline" icon={<Sparkles className="h-3.5 w-3.5" />}>
            AI insights
          </Badge>
        }
      />

      {/* Monster coach + hero number */}
      <section className="flex flex-col items-center pt-8 text-center">
        <MonsterMascot state="thinking" message="Here's where your money leaks." size="md" />
        <Eyebrow className="mt-8">Flagged as unnecessary</Eyebrow>
        <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
          {formatCents(unnecessaryTotal, currency)}
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
          Review the spends below and flag the ones you could skip next time.
        </p>
      </section>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState className="pt-8" title="Nothing to review yet" description="Add expenses to see insights." />
      ) : (
        <>
          {/* Suggested moves — static placeholder (LLM not built) */}
          <section className="pt-12">
            <Eyebrow>Suggested moves</Eyebrow>
            <div className="mt-3 rounded-2xl border border-dashed border-border-default p-5 text-center text-sm text-text-muted">
              AI suggestions coming soon.
            </div>
          </section>

          {/* Category over-spend */}
          {topCategories.length > 0 && (
            <section className="pt-10">
              <Eyebrow>Where it adds up</Eyebrow>
              <div className="mt-4 space-y-4">
                {topCategories.map((c) => (
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

          {/* Unnecessary-spend review */}
          <section className="pt-10">
            <Eyebrow>Review these</Eyebrow>
            <div className="mt-3 divide-y divide-border-default">
              {items.slice(0, 12).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{e.item}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      <span className="tabular-nums">{formatCents(e.amount_cents, currency)}</span>
                    </p>
                  </div>
                  {e.is_unnecessary ? (
                    <button
                      type="button"
                      onClick={() => void markUnnecessary(e.id, false)}
                      className="shrink-0"
                      aria-label="Unflag"
                    >
                      <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>
                        Flagged
                      </Badge>
                    </button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() => void markUnnecessary(e.id, true)}
                    >
                      Mark unnecessary
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Link
              to="/expenses"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-primary-50 hover:text-text-primary"
            >
              Open full expense review
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </>
      )}
    </Screen>
  )
}
