import React from 'react'
import { Loader2, Mic } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] rounded-full'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
      icon: 'p-2.5 text-sm aspect-square',
    }

    const variantStyles = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600',
      secondary:
        'bg-transparent text-text-secondary hover:bg-primary-50 hover:text-text-primary border border-border-default',
      outline:
        'bg-transparent text-text-secondary border border-border-default hover:bg-primary-50 hover:text-text-primary hover:border-border-strong',
      ghost: 'bg-transparent text-text-secondary hover:bg-primary-50 hover:text-text-primary',
      danger:
        'bg-status-danger text-white hover:brightness-95',
      glass:
        'bg-surface-overlay text-text-primary border border-border-default hover:bg-primary-50',
    }

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export interface MicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isRecording?: boolean
  isThinking?: boolean
  size?: 'md' | 'lg' | 'xl'
}

export const MicButton: React.FC<MicButtonProps> = ({
  isRecording = false,
  isThinking = false,
  size = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-24 h-24 text-3xl',
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer Pulse Rings when recording */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary-500/40 animate-ping" />
          <span className="absolute -inset-3 rounded-full border-2 border-primary-400/50 animate-pulse" />
        </>
      )}

      {/* Mic Trigger */}
      <button
        disabled={disabled || isThinking}
        className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 ${
          sizeClasses[size]
        } ${
          isRecording
            ? 'bg-status-danger text-white ring-4 ring-status-danger/20 animate-bounce'
            : isThinking
            ? 'bg-surface-raised text-primary-600 border-2 border-border-strong'
            : 'bg-primary-500 hover:bg-primary-600 text-white ring-4 ring-primary-500/15'
        } ${className}`}
        {...props}
      >
        {isThinking ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary-300" />
        ) : (
          <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
        )}
      </button>
    </div>
  )
}
