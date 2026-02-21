/**
 * Dashboard Layout Component
 * Main layout for authenticated pages
 */

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { SettingsDropdown } from '@/components/SettingsDropdown'
import { QUERY_KEYS } from '@/utils/constants'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleWalletsNavClick = () => {
    // Refresh user subscription and wallets when navigating to Wallets
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - premium SaaS style */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-6 md:gap-10">
              <Link
                to="/dashboard"
                className="text-lg font-semibold text-foreground tracking-tight transition-colors hover:text-primary"
              >
                {t('common.appName')}
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/wallets"
                  onClick={handleWalletsNavClick}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/wallets'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {t('nav.wallets')}
                </Link>
                <Link
                  to="/transactions"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/transactions'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {t('nav.transactions')}
                </Link>
                <Link
                  to="/billing"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/billing'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {t('nav.billing')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="hidden sm:block text-sm text-muted-foreground">
                {t('nav.welcome', { name: user?.profile.name })}
              </span>
              <SettingsDropdown />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - generous spacing for mobile thumb zones */}
      <main className="container mx-auto px-4 sm:px-6 py-6 md:py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
