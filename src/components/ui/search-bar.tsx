import React from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  onFilterClick?: () => void
  hasActiveFilters?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search expenses, places, items...',
  onFilterClick,
  hasActiveFilters = false,
}) => {
  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full bg-surface-raised border border-border-default text-text-primary placeholder-text-muted text-sm pl-11 pr-10 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              if (onClear) onClear()
            }}
            className="absolute right-3 text-text-muted hover:text-text-primary p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className={`relative p-3 rounded-full border transition-all duration-200 shrink-0 ${
            hasActiveFilters
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'bg-surface-raised border-border-default text-text-secondary hover:text-text-primary hover:bg-primary-50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-status-success border-2 border-surface-base" />
          )}
        </button>
      )}
    </div>
  )
}
