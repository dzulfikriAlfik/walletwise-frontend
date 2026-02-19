/**
 * Dashboard Layout Component
 * Main layout for authenticated pages
 */

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { SettingsDropdown } from '@/components/SettingsDropdown'
import { QUERY_KEYS } from '@/utils/constants'

export default function DashboardLayout() {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                {t('common.appName')}
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/wallets"
                  onClick={handleWalletsNavClick}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('nav.wallets')}
                </Link>
                <Link
                  to="/transactions"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('nav.transactions')}
                </Link>
                <Link
                  to="/billing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('nav.billing')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {t('nav.welcome', { name: user?.profile.name })}
              </div>
              <SettingsDropdown />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
