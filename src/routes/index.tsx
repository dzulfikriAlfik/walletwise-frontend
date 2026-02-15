/**
 * Application Routing Configuration
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

// Pages
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import Index from '@/pages/Index'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WalletsPage from '@/pages/Wallets/WalletsPage'
import BillingPage from '@/pages/Billing/BillingPage'

/**
 * Protected Route Component
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

/**
 * Guest Route Component (redirect to dashboard if authenticated)
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

/**
 * Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>,
      },
    ],
  },
  {
    path: '/wallets',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <WalletsPage />,
      },
    ],
  },
  {
    path: '/billing',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <BillingPage />,
      },
    ],
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div className="p-6"><h1 className="text-2xl font-bold">Transactions</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
