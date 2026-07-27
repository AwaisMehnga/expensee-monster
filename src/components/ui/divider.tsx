import React from 'react'

export interface DividerProps {
  label?: string
  className?: string
}

export const Divider: React.FC<DividerProps> = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`relative flex items-center my-4 ${className}`}>
        <div className="flex-1 border-t border-border-default" />
        <span className="shrink-0 mx-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 border-t border-border-default" />
      </div>
    )
  }

  return <hr className={`my-4 border-t border-border-default ${className}`} />
}
