/**
 * Authentication Hook
 * Provides authentication functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { QUERY_KEYS } from '@/utils/constants'
import type { LoginCredentials, RegisterData } from '@/types'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore()

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    },
  })

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    },
  })

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
    },
  })

  /**
   * Get user profile query
   */
  const { data: profile } = useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
  })

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      await loginMutation.mutateAsync(credentials)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      await registerMutation.mutateAsync(userData)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  return {
    user,
    profile,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
  }
}
