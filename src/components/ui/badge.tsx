import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'warning' | 'danger' | 'success' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  onRemove?: () => void
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onRemove,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  }

  const variantStyles = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-surface-overlay text-text-secondary border border-border-default',
    outline: 'bg-transparent text-primary-700 border border-primary-300/70',
    warning: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border border-status-danger/20',
    success: 'bg-status-success/10 text-status-success border border-status-success/20',
    glass: 'bg-surface-overlay text-text-primary border border-border-default',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 text-xs hover:text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </span>
  )
}
