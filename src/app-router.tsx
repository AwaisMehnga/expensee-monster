import { Suspense, useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './routes'
import { LoadingScreen } from './components/ui'
import { useSettingsStore } from './store'

export default function Approuter() {
  const loadSettings = useSettingsStore((s) => s.load)
  const element = useRoutes(routes)

  // Load app settings once, app-wide (currency, theme, onboarding flag…).
  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
}
