/**
 * Billing Page
 * Subscription plans and dummy payment upgrade
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { billingService, type BillingPlans } from '@/services/billing.service'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { QUERY_KEYS } from '@/utils/constants'
import { SubscriptionTier } from '@/types'

export default function BillingPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const updateUser = useAuthStore((s) => s.updateUser)

  const [selectedPlan, setSelectedPlan] = useState<'pro_trial' | 'pro' | 'pro_plus' | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [formError, setFormError] = useState('')

  const { data: plans, isLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: billingService.getPlans,
  })

  const upgradeMutation = useMutation({
    mutationFn: (params: {
      targetTier: 'pro_trial' | 'pro' | 'pro_plus'
      billingPeriod: 'monthly' | 'yearly'
      cardNumber: string
      expiry: string
      cvv: string
    }) =>
      billingService.dummyPayment({
        targetTier: params.targetTier,
        billingPeriod: params.billingPeriod,
        cardNumber: params.cardNumber,
        expiry: params.expiry,
        cvv: params.cvv,
      }),
    onSuccess: (data) => {
      // Update user subscription in store
      updateUser({
        subscription: {
          tier: data.subscription.tier as SubscriptionTier,
          isActive: true,
          startDate: data.subscription.startDate,
          endDate: data.subscription.endDate || undefined,
        },
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
      setSelectedPlan(null)
      setCardNumber('')
      setExpiry('')
      setCvv('')
      setFormError('')
    },
  })

  const rawTier = user?.subscription?.tier || 'free'
  const subEndDate = user?.subscription?.endDate

  // When pro_trial expired: display as Free, show upgrade buttons, but disable Free Trial
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

  const hasUsedProTrial = rawTier === SubscriptionTier.PRO_TRIAL

  const handleUpgrade = (tier: 'pro_trial' | 'pro' | 'pro_plus') => {
    setSelectedPlan(tier)
  }

  const handleConfirmPayment = () => {
    if (!selectedPlan) return
    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setFormError(t('billing.cardRequired'))
      return
    }
    setFormError('')
    upgradeMutation.mutate({
      targetTier: selectedPlan,
      billingPeriod,
      cardNumber,
      expiry,
      cvv,
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

      {/* Billing period toggle */}
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

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <PlanCard
          plan={plans.free}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
        />

        {/* Pro Plan */}
        <PlanCard
          plan={plans.pro}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro')}
          onTrial={!hasUsedProTrial ? () => handleUpgrade('pro_trial') : undefined}
          canUpgrade={effectiveDisplayTier === SubscriptionTier.FREE}
        />

        {/* Pro+ Plan */}
        <PlanCard
          plan={plans.pro_plus}
          currentTier={rawTier}
          effectiveDisplayTier={effectiveDisplayTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro_plus')}
          canUpgrade={effectiveDisplayTier === SubscriptionTier.FREE || effectiveDisplayTier === SubscriptionTier.PRO}
        />
      </div>

      {/* Dummy Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('billing.dummyPayment')}</CardTitle>
                <CardDescription>
                  {t('billing.dummyPaymentDesc')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedPlan === 'pro_trial'
                  ? t('billing.upgradeToProTrial', { days: plans.pro.trialDays })
                  : t('billing.upgradeTo', {
                      tier: selectedPlan.replace('_', '+'),
                      period: billingPeriod,
                    })}
              </p>
              <div className="space-y-2">
                <Input
                  placeholder={t('billing.cardPlaceholder')}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  autoComplete="off"
                  required
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <Input
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              {upgradeMutation.isError && (
                <p className="text-sm text-destructive">
                  {(upgradeMutation.error as { error?: { message?: string } })?.error?.message || t('billing.paymentFailed')}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={upgradeMutation.isPending}
                >
                  {upgradeMutation.isPending ? t('common.processing') : t('billing.pay')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  disabled={upgradeMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
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
