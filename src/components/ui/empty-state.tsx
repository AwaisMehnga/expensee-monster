import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <div className="mb-5 text-text-muted">
        {icon || <Inbox className="w-12 h-12" strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs mt-2 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
