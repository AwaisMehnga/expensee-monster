import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FloatingNav, LoadingScreen } from './components/ui'
import { useSettingsStore } from './store'

export default function Layout() {
  const { pathname } = useLocation()
  const loaded = useSettingsStore((s) => s.loaded)
  const onboarded = useSettingsStore((s) => s.settings?.onboarded)

  // Wait for settings before deciding; first run → onboarding.
  if (!loaded) return <LoadingScreen />
  if (!onboarded) return <Navigate to="/onboarding" replace />

  return (
    <>
      {/* Keyed on the path so each navigation replays the enter animation */}
      <div key={pathname} className="animate-page">
        <Outlet />
      </div>
      <FloatingNav />
    </>
  )
}
