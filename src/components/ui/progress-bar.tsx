import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ProgressBarProps {
  value: number // 0 to 100
  max?: number
  label?: string
  sublabel?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  showPercentage = true,
  color = 'primary',
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
  }

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage || sublabel) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <div>
            {label && <span className="text-text-primary block">{label}</span>}
            {sublabel && <span className="text-text-muted font-normal text-[11px] block">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="text-primary-700 font-bold ml-2">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-primary-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => (
  <div
    className={`animate-pulse rounded-xl bg-surface-raised border border-border-default ${className}`}
    {...props}
  />
)

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-primary-600">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <p className="text-xs font-medium text-text-muted animate-pulse">{text}</p>}
    </div>
  )
}
