import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'

export interface SelectMenuOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
  description?: string
}

export interface SelectMenuProps<T extends string = string> {
  options: SelectMenuOption<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

interface Coords {
  left: number
  width: number
  placement: 'below' | 'above'
  offset: number
  maxHeight: number
}

export function SelectMenu<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  searchable = false,
  className = '',
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [coords, setCoords] = useState<Coords | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value) ?? null

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    )
  }, [options, query, searchable])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    // Position off the trigger; flip above when there isn't room below.
    const place = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const gap = 6
      const margin = 8
      const spaceBelow = window.innerHeight - r.bottom
      const spaceAbove = r.top
      const below = spaceBelow >= 240 || spaceBelow >= spaceAbove
      setCoords({
        left: Math.max(margin, Math.min(r.left, window.innerWidth - r.width - margin)),
        width: r.width,
        placement: below ? 'below' : 'above',
        offset: below ? r.bottom + gap : window.innerHeight - r.top + gap,
        maxHeight: Math.min(320, (below ? spaceBelow : spaceAbove) - gap - margin),
      })
    }
    place()
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border-default bg-surface-raised px-4 py-3 text-left text-sm font-semibold text-text-primary transition-colors hover:border-border-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`flex min-w-0 items-center gap-2 ${selected ? '' : 'font-normal text-text-muted'}`}>
          {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
              ...(coords.placement === 'below' ? { top: coords.offset } : { bottom: coords.offset }),
            }}
            className="z-70 flex animate-scale-up flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-raised shadow-lg"
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-border-default px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            )}
            <ul role="listbox" className="flex-1 overflow-auto p-1.5">
              {filtered.length ? (
                filtered.map((opt) => {
                  const active = opt.value === value
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(opt.value)
                          setOpen(false)
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-text-secondary hover:bg-primary-50 hover:text-text-primary'
                        }`}
                      >
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{opt.label}</span>
                          {opt.description && (
                            <span className="block truncate text-xs font-normal text-text-muted">
                              {opt.description}
                            </span>
                          )}
                        </span>
                        {active && <Check className="h-4 w-4 shrink-0 text-primary-600" />}
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className="px-3 py-3 text-sm text-text-muted">No matches</li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
