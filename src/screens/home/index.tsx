import { ArrowRight, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Button,
  Eyebrow,
  MicButton,
  MonsterMascot,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../../components/ui'

export default function HomeScreen() {
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
      <section className="pt-12">
        <Eyebrow>Left to spend today</Eyebrow>
        <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">$46.20</p>

        <div className="mt-5">
          <ProgressBar value={58} label="Day budget" sublabel="$120" color="primary" />
        </div>

        <div className="mt-6 grid grid-cols-2 divide-x divide-border-default border-y border-border-default">
          <div className="py-4 pr-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Spent</p>
            <p className="mt-1 text-xl font-bold tabular-nums">$73.80</p>
          </div>
          <div className="py-4 pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Budget</p>
            <p className="mt-1 text-xl font-bold tabular-nums">$120.00</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-primary-600">You're pacing well</span> — about
          $46 left with 6 hours in the day. Keep coffees under $10 and you'll finish under budget.
        </p>

        <Button variant="outline" fullWidth className="mt-6" rightIcon={<ArrowRight className="h-4 w-4" />}>
          See this week
        </Button>
      </section>
    </Screen>
  )
}
