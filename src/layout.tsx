import { Outlet, useLocation } from 'react-router-dom'
import { FloatingNav } from './components/ui'

export default function Layout() {
  const { pathname } = useLocation()

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
