/**
 * Dashboard Layout Component
 * Main layout for authenticated pages
 */

import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { SettingsDropdown } from '@/components/SettingsDropdown'
import { QUERY_KEYS } from '@/utils/constants'

const navItems: Array<{ to: string; labelKey: string; onNavigate?: boolean }> = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/wallets', labelKey: 'nav.wallets', onNavigate: true },
  { to: '/transactions', labelKey: 'nav.transactions' },
  { to: '/billing', labelKey: 'nav.billing' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleWalletsNavClick = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background">
      {/* Header - more padding on mobile, hamburger for nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto px-5 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16 min-h-[56px] gap-4">
            <div className="flex items-center gap-4 md:gap-10 min-w-0">
              <Link
                to="/dashboard"
                className="text-base sm:text-lg font-semibold text-foreground tracking-tight transition-colors hover:text-primary shrink-0"
              >
                {t('common.appName')}
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={item.onNavigate ? handleWalletsNavClick : undefined}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === item.to
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                {t('nav.welcome', { name: user?.profile.name })}
              </span>
              <SettingsDropdown />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex"
              >
                {t('common.logout')}
              </Button>
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="md:hidden p-2.5 -m-2.5 rounded-xl text-foreground hover:bg-muted/60 transition-colors touch-manipulation"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <nav
            className="fixed inset-x-0 top-16 z-50 md:hidden bg-card border-b border-border shadow-xl"
            aria-label="Main navigation"
          >
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.to} onClick={closeMobileMenu}>
                  <Link
                    to={item.to}
                    onClick={item.onNavigate ? handleWalletsNavClick : undefined}
                    className={`block px-4 py-3.5 text-base font-medium rounded-xl transition-colors ${
                      location.pathname === item.to
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-border space-y-2">
                <p className="px-4 py-2 text-sm text-muted-foreground">
                  {t('nav.welcome', { name: user?.profile.name })}
                </p>
                <div className="px-2">
                  <SettingsDropdown />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => { closeMobileMenu(); handleLogout(); }}
                >
                  {t('common.logout')}
                </Button>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="mx-auto px-5 sm:px-6 max-w-7xl py-6 md:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
