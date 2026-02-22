/**
 * Subscription Socket Hook
 * Listens for realtime subscription updates via WebSocket (no polling)
 */

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { QUERY_KEYS } from '@/utils/constants'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1$/, '') || 'http://localhost:3000'

export function useSubscriptionSocket() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  useEffect(() => {
    if (!user?.profile?.id) return

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { userId: user.profile.id },
      transports: ['websocket', 'polling'],
    })

    socket.on('subscription:updated', (data: { tier: string; isActive: boolean }) => {
      updateUser({
        subscription: {
          tier: data.tier as 'free' | 'pro_trial' | 'pro' | 'pro_plus',
          isActive: data.isActive,
          startDate: user?.subscription?.startDate ?? new Date().toISOString(),
          endDate: user?.subscription?.endDate,
        },
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    })

    return () => {
      socket.disconnect()
    }
  }, [user?.profile?.id, updateUser, queryClient])
}
