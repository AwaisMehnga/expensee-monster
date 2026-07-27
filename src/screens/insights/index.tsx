import { useState } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  Eyebrow,
  MonsterMascot,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../../components/ui'

const insights = [
  {
    id: 'coffee',
    title: 'Cap your coffee runs',
    rationale: 'Late mornings are your priciest slot — a weekly cap trims the peaks.',
    save: '$42/mo',
  },
  {
    id: 'subs',
    title: 'Pause an unused subscription',
    rationale: 'Two apps stay idle. Drop one before the next billing cycle.',
    save: '$54/mo',
  },
  {
    id: 'transit',
    title: 'Swap two rideshare days',
    rationale: 'Scheduled transit on Tue and Thu lowers the monthly average.',
    save: '$32/mo',
  },
]

const flagged = [
  { id: 'f1', name: 'Duplicate music app', merchant: 'TuneStack', amount: '$11.99' },
  { id: 'f2', name: 'Late-night delivery', merchant: 'QuickBite', amount: '$28.40' },
  { id: 'f3', name: 'Unused cloud storage', merchant: 'DriveBox', amount: '$9.99' },
]

export default function InsightsScreen() {
  const [marked, setMarked] = useState<Record<string, boolean>>({})

  return (
    <Screen>
        {/* Header */}
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
          <MonsterMascot
            state="thinking"
            message="I found a few easy wins this month."
            size="md"
          />
          <Eyebrow className="mt-8">You could save</Eyebrow>
          <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">$128/mo</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
            Three small changes below get you there — no big lifestyle cuts needed.
          </p>
        </section>

        {/* AI suggestions — hairline rows */}
        <section className="pt-12">
          <Eyebrow>Suggested moves</Eyebrow>
          <div className="mt-3 divide-y divide-border-default">
            {insights.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.rationale}</p>
                </div>
                <Badge variant="success" className="mt-0.5 shrink-0">
                  {item.save}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Category over-spend */}
        <section className="pt-10">
          <Eyebrow>Where it adds up</Eyebrow>
          <div className="mt-4 space-y-4">
            <ProgressBar value={112} max={100} label="Dining out" sublabel="$412 of $360" color="danger" />
            <ProgressBar value={68} label="Transport" sublabel="$204 of $300" color="primary" />
          </div>
        </section>

        {/* Unnecessary-spend review — hairline rows */}
        <section className="pt-10">
          <Eyebrow>Review these</Eyebrow>
          <div className="mt-3 divide-y divide-border-default">
            {flagged.map((item) => {
              const isMarked = marked[item.id]
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {item.merchant} · <span className="tabular-nums">{item.amount}</span>
                    </p>
                  </div>
                  {isMarked ? (
                    <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />} className="shrink-0">
                      Flagged
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() => setMarked((m) => ({ ...m, [item.id]: true }))}
                    >
                      Mark unnecessary
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <Link
            to="/expenses"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-primary-50 hover:text-text-primary"
          >
            Open full expense review
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
    </Screen>
  )
}
