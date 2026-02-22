/**
 * Category Service
 * Handles category-related API calls
 */

import { apiClient } from './api/client'
import type { CategoryOption, Category, CreateCategoryData, UpdateCategoryData } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const categoryService = {
  /** Get all category options (system + custom) for transaction forms */
  getAll: async (): Promise<CategoryOption[]> => {
    const { data } = await apiClient.get<ApiResponse<CategoryOption[]>>('/categories')
    return data.data
  },

  /** Get custom categories only (for CRUD page) - Pro/Pro Trial only */
  getCustom: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories/custom')
    return data.data
  },

  create: async (payload: CreateCategoryData): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<Category>>('/categories', payload)
    return data.data
  },

  update: async (id: string, payload: UpdateCategoryData): Promise<Category> => {
    const { data } = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
