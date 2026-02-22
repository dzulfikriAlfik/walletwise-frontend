/**
 * Billing Page
 * Subscription plans and payment (Stripe / Xendit)
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { billingService, type BillingPlans } from '@/services/billing.service'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { useSubscriptionSocket } from '@/hooks/useSubscriptionSocket'
import { PaymentModal } from '@/components/PaymentModal'
import { QUERY_KEYS } from '@/utils/constants'
import { SubscriptionTier } from '@/types'

export default function BillingPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, queryClient])
  const updateUser = useAuthStore((s) => s.updateUser)

  useSubscriptionSocket()

  const [selectedPlan, setSelectedPlan] = useState<'pro_trial' | 'pro' | 'pro_plus' | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const { data: plans, isLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: billingService.getPlans,
  })

  const [pendingInvoicePopup, setPendingInvoicePopup] = useState<{ invoiceUrl: string } | null>(null)

  const createPaymentMutation = useMutation({
    mutationFn: billingService.createPayment,
    onSuccess: (data) => {
      if (data.status === 'paid' && data.subscription) {
        updateUser({
          subscription: {
            tier: data.subscription.tier as SubscriptionTier,
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: data.subscription.endDate,
          },
        })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
        setSelectedPlan(null)
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else if (data.invoiceUrl) {
        if (data.message === 'Reusing existing pending invoice') {
          setSelectedPlan(null)
          setPendingInvoicePopup({ invoiceUrl: data.invoiceUrl })
        } else {
          window.open(data.invoiceUrl, '_blank', 'noopener,noreferrer')
          setSelectedPlan(null)
        }
      } else {
        setSelectedPlan(null)
      }
    },
  })

  const rawTier = user?.subscription?.tier || 'free'
  const subEndDate = user?.subscription?.endDate

  const effectiveDisplayTier =
    rawTier === SubscriptionTier.PRO_TRIAL && subEndDate
      ? (() => {
          const end = new Date(subEndDate)
          const now = new Date()
          return !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()
            ? SubscriptionTier.FREE
            : rawTier
        })()
      : rawTier

  const showProTrial = rawTier === SubscriptionTier.FREE

  const handleUpgrade = (tier: 'pro_trial' | 'pro' | 'pro_plus') => {
    setSelectedPlan(tier)
  }

  const handleSelectGateway = (gateway: 'stripe' | 'xendit', method: 'card' | 'invoice' | 'va' | 'ewallet' | 'qris') => {
    if (!selectedPlan) return
    createPaymentMutation.mutate({
      targetTier: selectedPlan,
      billingPeriod,
      gateway,
      method: method === 'card' ? 'card' : 'invoice',
    })
  }

  const handleActivateTrial = () => {
    if (!selectedPlan || selectedPlan !== 'pro_trial') return
    createPaymentMutation.mutate({
      targetTier: 'pro_trial',
      billingPeriod: 'monthly',
      gateway: 'stripe',
      method: 'card',
    })
  }

  if (isLoading || !plans) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-64 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
                <div className="space-y-2 mt-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('billing.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('billing.currentPlan')}{' '}
          <span className="font-medium capitalize">{effectiveDisplayTier.replace(/_/g, '+')}</span>
        </p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-muted/50 w-fit">
        <Button
          variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillingPeriod('monthly')}
        >
          {t('billing.monthly')}
        </Button>
        <Button
          variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillingPeriod('yearly')}
        >
          {t('billing.yearly')}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <PlanCard
          plan={plans.free}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
        />

        <PlanCard
          plan={plans.pro}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro')}
          onTrial={showProTrial ? () => handleUpgrade('pro_trial') : undefined}
          canUpgrade={effectiveDisplayTier === SubscriptionTier.FREE || effectiveDisplayTier === SubscriptionTier.PRO_TRIAL}
        />

        <PlanCard
          plan={plans.pro_plus}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro_plus')}
          canUpgrade={
            effectiveDisplayTier === SubscriptionTier.FREE ||
            effectiveDisplayTier === SubscriptionTier.PRO_TRIAL ||
            effectiveDisplayTier === SubscriptionTier.PRO
          }
        />
      </div>

      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        selectedPlan={selectedPlan!}
        billingPeriod={billingPeriod}
        onSelectGateway={handleSelectGateway}
        onActivateTrial={handleActivateTrial}
        isLoading={createPaymentMutation.isPending}
      />

      {createPaymentMutation.isError && (
        <p className="text-sm text-destructive">
          {(createPaymentMutation.error as { error?: { message?: string } })?.error?.message || t('billing.paymentFailed')}
        </p>
      )}

      {/* Pending payment popup - existing invoice */}
      {pendingInvoicePopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setPendingInvoicePopup(null)}
        >
          <div
            className="bg-card rounded-xl shadow-xl border border-border p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
              {t('billing.pendingPaymentTitle')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('billing.pendingPaymentDesc')}
            </p>
            <a
              href={pendingInvoicePopup.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              {t('billing.openPaymentPage')}
            </a>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPendingInvoicePopup(null)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanCard({
  plan,
  currentTier,
  effectiveDisplayTier,
  billingPeriod,
  onUpgrade,
  onTrial,
  canUpgrade = false,
}: {
  plan: BillingPlans['free'] | (BillingPlans['pro'] & { prices?: { monthly: number; yearly: number } })
  currentTier: string
  effectiveDisplayTier: string
  billingPeriod: 'monthly' | 'yearly'
  onUpgrade?: () => void
  onTrial?: () => void
  canUpgrade?: boolean
}) {
  const { t } = useTranslation()
  const price = 'prices' in plan && plan.prices
    ? billingPeriod === 'yearly'
      ? plan.prices.yearly
      : plan.prices.monthly
    : 0

  const isCurrent =
    plan.tier === 'free'
      ? effectiveDisplayTier === 'free'
      : plan.tier === currentTier

  const isRecommended = plan.tier === 'pro'
  return (
    <Card
      className={`relative transition-all duration-200 ${
        isRecommended ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20' : ''
      } ${isCurrent ? 'border-primary' : ''}`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-4 right-4 flex justify-center">
          <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            {t('billing.recommended')}
          </span>
        </div>
      )}
      <CardHeader className={isRecommended ? 'pt-6' : ''}>
        <CardTitle className="flex items-center justify-between gap-2">
          {plan.name}
          {isCurrent && (
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">{t('billing.active')}</span>
          )}
        </CardTitle>
        <CardDescription>
          {plan.maxWallets === null ? t('billing.unlimitedWallets') : t('billing.walletsUpTo', { count: plan.maxWallets })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {price > 0 ? (
          <div>
            <span className="text-2xl font-bold text-foreground">${price}</span>
            <span className="text-muted-foreground ml-1">{billingPeriod === 'yearly' ? t('billing.perYear') : t('billing.perMonth')}</span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-foreground">$0</div>
        )}

        <ul className="space-y-2.5 text-sm text-muted-foreground">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {canUpgrade && (onUpgrade || onTrial) && (
          <div className="flex flex-col gap-2">
            {onTrial && plan.tier === 'pro' && (
              <Button
                className="w-full"
                variant="outline"
                onClick={onTrial}
                disabled={isCurrent}
              >
                {t('billing.useTrial')}
              </Button>
            )}
            {onUpgrade && (
              <Button
                className="w-full"
                variant={isCurrent ? 'outline' : 'default'}
                onClick={onUpgrade}
                disabled={isCurrent}
              >
                {isCurrent ? t('billing.planCurrent') : t('common.upgrade')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
