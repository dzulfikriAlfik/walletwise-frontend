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

  const currentTier = user?.subscription?.tier || 'free'

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
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">{t('billing.loadingPlans')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('billing.title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('billing.currentPlan')} <span className="font-medium capitalize">{currentTier.replace('_', '+')}</span>
        </p>
      </div>

      {/* Billing period toggle */}
      <div className="flex gap-2">
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
          currentTier={currentTier}
          billingPeriod={billingPeriod}
        />

        {/* Pro Plan */}
        <PlanCard
          plan={plans.pro}
          currentTier={currentTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro')}
          onTrial={() => handleUpgrade('pro_trial')}
          canUpgrade={currentTier === 'free'}
        />

        {/* Pro+ Plan */}
        <PlanCard
          plan={plans.pro_plus}
          currentTier={currentTier}
          billingPeriod={billingPeriod}
          onUpgrade={() => handleUpgrade('pro_plus')}
          canUpgrade={currentTier === 'free' || currentTier === 'pro'}
        />
      </div>

      {/* Dummy Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
              <p className="text-sm text-gray-600">
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
                <p className="text-sm text-red-600">
                  {formError}
                </p>
              )}

              {upgradeMutation.isError && (
                <p className="text-sm text-red-600">
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
  billingPeriod,
  onUpgrade,
  onTrial,
  canUpgrade = false,
}: {
  plan: BillingPlans['free'] | (BillingPlans['pro'] & { prices?: { monthly: number; yearly: number } })
  currentTier: string
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

  const isCurrent = plan.tier === currentTier

  return (
    <Card className={isCurrent ? 'border-blue-500 border-2' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {isCurrent && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t('billing.active')}</span>
          )}
        </CardTitle>
        <CardDescription>
          {plan.maxWallets === null ? t('billing.unlimitedWallets') : t('billing.walletsUpTo', { count: plan.maxWallets })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {price > 0 ? (
          <div>
            <span className="text-2xl font-bold">${price}</span>
            <span className="text-gray-500">{billingPeriod === 'yearly' ? t('billing.perYear') : t('billing.perMonth')}</span>
          </div>
        ) : (
          <div className="text-2xl font-bold">$0</div>
        )}

        <ul className="space-y-2 text-sm">
          {plan.features.map((f, i) => (
            <li key={i}>✓ {f}</li>
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
