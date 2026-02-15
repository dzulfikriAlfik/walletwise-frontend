/**
 * Dashboard Layout Component
 * Main layout for authenticated pages
 */

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                WalletWise
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallets"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Wallets
                </Link>
                <Link
                  to="/transactions"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Transactions
                </Link>
                <Link
                  to="/billing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Billing
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user?.profile.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
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
