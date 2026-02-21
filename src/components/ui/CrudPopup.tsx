/**
 * CrudPopup - Responsive popup for CRUD forms
 * Desktop/Tablet: Centered Modal
 * Mobile: Bottom Sheet
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export interface CrudPopupProps {
  open: boolean
  onClose: () => void
  title: string
  formId?: string
  onPrimaryClick?: () => void
  primaryLabel: string
  primaryLoading?: boolean
  primaryDisabled?: boolean
  secondaryLabel: string
  onSecondaryClick: () => void
  children: React.ReactNode
  error?: string
}

export function CrudPopup({
  open,
  onClose,
  title,
  formId,
  onPrimaryClick,
  primaryLabel,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel,
  onSecondaryClick,
  children,
  error,
}: CrudPopupProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !primaryLoading) onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose, primaryLoading])

  if (!open) return null

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 px-4 md:px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={primaryLoading}
          className="p-2 -m-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body - scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-4">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
            {error}
          </div>
        )}
        {children}
      </div>

      {/* Footer - sticky */}
      <div className="shrink-0 px-4 md:px-6 py-4 border-t border-border bg-card flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onSecondaryClick}
          disabled={primaryLoading}
          className="w-full sm:w-auto"
        >
          {secondaryLabel}
        </Button>
        <Button
          type={formId ? 'submit' : 'button'}
          form={formId}
          onClick={!formId ? onPrimaryClick : undefined}
          disabled={primaryDisabled || primaryLoading}
          className="w-full sm:w-auto"
        >
          {primaryLoading ? t('common.processing') : primaryLabel}
        </Button>
      </div>
    </>
  )

  const backdrop = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      onClick={primaryLoading ? undefined : onClose}
      aria-hidden="true"
    />
  )

  if (isMobile) {
    return createPortal(
      <>
        {backdrop}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] flex flex-col bg-card rounded-t-2xl shadow-xl border-t border-border"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="crud-popup-title"
        >
          {/* Drag indicator */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          {content}
        </div>
      </>,
      document.body
    )
  }

  return createPortal(
    <>
      {backdrop}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-card rounded-xl shadow-xl border border-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crud-popup-title"
        >
          {content}
        </div>
      </div>
    </>,
    document.body
  )
}
