import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (options: { message: string; title?: string; type?: ToastType; duration?: number }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, title, type = 'info', duration = 4000 }: { message: string; title?: string; type?: ToastType; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, message, title, type, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string, title?: string) => toast({ message, title, type: 'success' }), [toast])
  const error = useCallback((message: string, title?: string) => toast({ message, title, type: 'error' }), [toast])
  const info = useCallback((message: string, title?: string) => toast({ message, title, type: 'info' }), [toast])
  const warning = useCallback((message: string, title?: string) => toast({ message, title, type: 'warning' }), [toast])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />,
    info: <Info className="w-5 h-5 text-status-info shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
  }

  const borders = {
    success: 'border-status-success/20 bg-surface-raised',
    error: 'border-status-danger/20 bg-surface-raised',
    info: 'border-status-info/20 bg-surface-raised',
    warning: 'border-status-warning/20 bg-surface-raised',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container — positioned above bottom nav */}
      <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 animate-fade-in ${borders[t.type]}`}
          >
            {icons[t.type]}
            <div className="flex-1 text-xs text-text-secondary">
              {t.title && <p className="font-bold text-sm text-text-primary mb-0.5">{t.title}</p>}
              <p>{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text-primary p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
