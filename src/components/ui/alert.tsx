import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export interface AlertBannerProps {
  title?: string
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'danger'
  onClose?: () => void
  className?: string
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-status-info/10 border-status-info/20 text-status-info',
    success: 'bg-status-success/10 border-status-success/20 text-status-success',
    warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
    danger: 'bg-status-danger/10 border-status-danger/20 text-status-danger',
  }

  const icons = {
    info: <Info className="w-5 h-5 text-status-info shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-status-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />,
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${variantStyles[variant]} ${className}`}>
      {icons[variant]}
      <div className="flex-1 text-xs leading-relaxed">
        {title && <h4 className="font-bold text-sm text-text-primary mb-1">{title}</h4>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-text-muted hover:text-text-primary p-0.5">
          ×
        </button>
      )}
    </div>
  )
}
