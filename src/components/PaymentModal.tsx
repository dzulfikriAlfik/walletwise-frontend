/**
 * Payment Modal
 * Gateway and method selector - no dummy card input
 * Full viewport backdrop, scroll lock, z-index above header
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/Button'

export type PaymentGateway = 'stripe' | 'xendit'
export type PaymentMethod = 'card' | 'invoice' | 'va' | 'ewallet' | 'qris'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: 'pro_trial' | 'pro' | 'pro_plus'
  billingPeriod: 'monthly' | 'yearly'
  onSelectGateway: (gateway: PaymentGateway, method: PaymentMethod) => void
  onActivateTrial?: () => void
  isLoading?: boolean
}

export function PaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  billingPeriod,
  onSelectGateway,
  onActivateTrial,
  isLoading = false,
}: PaymentModalProps) {
  const { t } = useTranslation()
  const [showStripeWarning, setShowStripeWarning] = useState(false)

  // Reset warning when modal closes
  useEffect(() => {
    if (!isOpen) setShowStripeWarning(false)
  }, [isOpen])

  // Scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle id="payment-modal-title">{t('billing.selectPayment')}</CardTitle>
            <CardDescription>
              {selectedPlan === 'pro_trial'
                ? t('billing.upgradeToProTrial', { days: 7 })
                : t('billing.upgradeTo', {
                    tier: selectedPlan.replace('_', '+'),
                    period: billingPeriod,
                  })}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPlan === 'pro_trial' ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('billing.trialNoPayment')}</p>
              <Button
                className="w-full"
                onClick={() => onActivateTrial?.()}
                disabled={isLoading}
              >
                {isLoading ? t('common.processing') : t('billing.activateTrial')}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium">{t('billing.paymentGateway')}</p>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStripeWarning(true)}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-medium">{t('billing.stripe')}</p>
                      <p className="text-sm text-muted-foreground">{t('billing.stripeDesc')}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGateway('xendit', 'invoice')}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="text-2xl">🏦</span>
                    <div>
                      <p className="font-medium">{t('billing.xendit')}</p>
                      <p className="text-sm text-muted-foreground">{t('billing.xenditDesc')}</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          <Button variant="outline" className="w-full" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
        </CardContent>
      </Card>

      {/* Stripe development warning popup */}
      {showStripeWarning && (
        <div
          className="absolute inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowStripeWarning(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl border border-border p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
              ⚠️ {t('billing.stripeDevWarning')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('billing.stripeDevWarningDesc')}
            </p>
            <Button
              className="w-full"
              onClick={() => setShowStripeWarning(false)}
              disabled={isLoading}
            >
              {t('common.ok')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(modalContent, document.body)
}
