import React from 'react'

/** Standard screen shell: full-height surface + centered max-width column. */
export function Screen({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="min-h-screen bg-surface-base px-4 pb-28 pt-5 text-text-primary sm:px-6">
      <div className={`mx-auto w-full max-w-xl ${className}`}>{children}</div>
    </div>
  )
}

/** Small uppercase section/brand label used throughout the app. */
export function Eyebrow({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted ${className}`}>
      {children}
    </p>
  )
}

/** Brand eyebrow + optional right-aligned action, used at the top of each screen. */
export function ScreenHeader({
  title = 'Expensee Monster',
  action,
}: {
  title?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex items-center justify-between">
      <Eyebrow>{title}</Eyebrow>
      {action}
    </header>
  )
}
