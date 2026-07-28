import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  footer?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-4xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay-backdrop transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Container */}
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-3xl bg-surface-raised border border-border-default shadow-xl z-10 overflow-hidden transform transition-all animate-scale-up`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-border-default">
            <div>
              {title && <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>}
              {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto text-sm text-text-secondary">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-surface-base border-t border-border-default flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-60 flex flex-col justify-end">
      {/* Blurred backdrop */}
      <div
        className="fixed inset-0 bg-overlay-backdrop backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative z-10 mx-auto max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t border-border-default bg-surface-raised p-6 shadow-xl animate-slide-up">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-default" />
        {title && (
          <h3 className="mb-4 text-center text-lg font-bold tracking-tight text-text-primary">{title}</h3>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
    </Modal>
  )
}
