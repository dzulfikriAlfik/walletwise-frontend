/**
 * Total Balance display with screenshot-style icons:
 * - ≈ (approximation symbol) before amount
 * - Eye icon to toggle visibility
 * - Question mark for help
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export interface TotalBalanceCardProps {
  amount: string
  label: string
  sublabel?: string
  className?: string
  helpTooltip?: string
}

export function TotalBalanceCard({
  amount,
  label,
  sublabel,
  className,
  helpTooltip,
}: TotalBalanceCardProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)

  return (
    <div
      className={cn(
        'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border p-6',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-3xl md:text-4xl font-bold text-foreground mt-1 tabular-nums">
            {visible ? (
              <>
                <span className="font-normal text-foreground/90">≈ </span>
                {amount}
              </>
            ) : (
              <span className="text-muted-foreground">••••••••</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors touch-manipulation"
          aria-label={visible ? 'Hide balance' : 'Show balance'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {visible ? (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </>
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </>
            )}
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {helpTooltip && (
          <button
            type="button"
            title={helpTooltip}
            className="shrink-0 w-5 h-5 rounded-full border border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground/50 flex items-center justify-center text-xs font-medium transition-colors"
            aria-label={helpTooltip}
          >
            ?
          </button>
        )}
      </div>
      {sublabel && (
        <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
      )}
    </div>
  )
}
