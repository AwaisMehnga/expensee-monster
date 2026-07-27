import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline' | 'interactive'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-surface-raised border border-border-default',
      glass: 'bg-surface-overlay border border-border-default',
      outline: 'bg-transparent border border-border-default',
      interactive:
        'bg-surface-raised border border-border-default hover:border-border-strong hover:bg-primary-50 transition-all duration-200 cursor-pointer active:scale-[0.99]',
    }

    return (
      <div
        ref={ref}
        className={`rounded-3xl p-4 md:p-5 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between pb-3 mb-3 border-b border-border-default ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-semibold text-text-primary tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-text-muted mt-0.5 ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`space-y-3 ${className}`} {...props}>{children}</div>

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-3 mt-3 border-t border-border-default flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
)

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-surface-raised border border-border-default rounded-2xl p-4 md:p-5 relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-extrabold text-text-primary mt-1 tracking-tight tabular-nums">
            {value}
          </h2>
          {subtitle && <p className="text-xs text-primary-700 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-surface-raised border border-border-default text-primary-500">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.isPositive ? 'text-status-success' : 'text-status-danger'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-text-muted font-normal">vs last period</span>
        </div>
      )}
    </div>
  )
}
