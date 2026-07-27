import { NavLink } from 'react-router-dom'
import { navItems } from '../../routes'

export function FloatingNav() {
  return (
    <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-full border border-border-default bg-surface-raised p-1.5 shadow-lg">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className="flex items-center justify-center"
            >
              {({ isActive }) => (
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? 'scale-105 bg-primary-500 text-white'
                      : 'text-text-muted hover:bg-primary-50 hover:text-text-primary active:scale-90'
                  }`}
                >
                  <Icon className="h-5.5 w-5.5" strokeWidth={2.25} />
                </span>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
