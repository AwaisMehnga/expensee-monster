import { lazy } from 'react'
import {
  BrainCircuit,
  Home as HomeIcon,
  LayoutGrid,
  Settings as SettingsIcon,
  Wallet as WalletIcon,
  type LucideIcon,
} from 'lucide-react'
import type { RouteObject } from 'react-router-dom'
import Layout from './layout'

// Screens are lazy-loaded; the <Suspense> boundary lives in app-router.
const Home = lazy(() => import('./screens/home'))
const Expenses = lazy(() => import('./screens/expenses'))
const Wallet = lazy(() => import('./screens/wallet'))
const Insights = lazy(() => import('./screens/insights'))
const Settings = lazy(() => import('./screens/settings'))

// Custom metadata rides in `handle` — `nav`/`icon` drive the bottom nav (below),
// so routes are the single source of truth for paths.
export type RouteHandle = {
  name: string
  title: string
  nav?: boolean
  icon?: LucideIcon
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { name: 'Log', title: 'Home', nav: true, icon: HomeIcon },
      },
      {
        path: 'expenses',
        element: <Expenses />,
        handle: { name: 'Expenses', title: 'Expenses', nav: true, icon: LayoutGrid },
      },
      {
        path: 'wallet',
        element: <Wallet />,
        handle: { name: 'Wallet', title: 'Wallet', nav: true, icon: WalletIcon },
      },
      {
        path: 'insights',
        element: <Insights />,
        handle: { name: 'Insights', title: 'Insights', nav: true, icon: BrainCircuit },
      },
      {
        path: 'settings',
        element: <Settings />,
        handle: { name: 'Settings', title: 'Settings', nav: true, icon: SettingsIcon },
      },
    ],
  },
]

// Derived once: the bottom-nav items, straight from the route table.
export type NavItem = { to: string; label: string; icon: LucideIcon; end: boolean }

export const navItems: NavItem[] = (routes[0].children ?? []).flatMap((route) => {
  const handle = route.handle as RouteHandle | undefined
  if (!handle?.nav || !handle.icon) return []
  return [
    {
      to: route.index ? '/' : `/${route.path}`,
      label: handle.name,
      icon: handle.icon,
      end: Boolean(route.index),
    },
  ]
})

export default routes
