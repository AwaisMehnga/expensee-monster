import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none">{leftIcon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-2xl bg-surface-raised border text-text-primary placeholder-text-muted text-sm px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-status-danger/40 focus:border-status-danger'
                : 'border-border-default focus:border-primary-500'
            } ${className}`}
            {...props}
          />
          {rightIcon && <span className="absolute right-3 text-text-muted">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-status-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full rounded-2xl bg-surface-raised border text-text-primary placeholder-text-muted text-sm px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[90px] ${
            error
              ? 'border-status-danger/40 focus:border-status-danger'
              : 'border-border-default focus:border-primary-500'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    )
  }
)
TextArea.displayName = 'TextArea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-2xl bg-surface-raised border text-text-primary text-sm px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 border-border-default focus:border-primary-500 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-raised text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-status-danger font-medium">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center justify-between gap-3 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-text-primary block">{label}</span>}
          {description && <span className="text-xs text-text-muted block">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
          checked ? 'bg-primary-500' : 'bg-surface-overlay'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  valueDisplay?: string | number
}

export const Slider: React.FC<SliderProps> = ({ label, valueDisplay, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {(label || valueDisplay !== undefined) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          {label && <span className="text-text-secondary">{label}</span>}
          {valueDisplay !== undefined && (
            <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
              {valueDisplay}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className={`w-full h-2 bg-surface-overlay rounded-full appearance-none cursor-pointer accent-primary-500 focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
