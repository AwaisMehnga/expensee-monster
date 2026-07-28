import { LoadingSpinner } from './progress-bar'

/** Full-screen branded loader — shown while the app boots (DB + settings). */
export function LoadingScreen({ text = 'Getting things ready…' }: { text?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface-base px-6 text-center">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
          Expensee Monster
        </p>
        <h1 className="text-2xl font-black tracking-tight text-text-primary">Loading your money</h1>
      </div>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
