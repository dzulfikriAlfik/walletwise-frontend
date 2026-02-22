/**
 * Category-related type definitions
 */

export interface CategoryOption {
  id: string
  name: string
  type: 'income' | 'expense'
  isSystem: boolean
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  type: 'income' | 'expense'
}

export interface UpdateCategoryData {
  name?: string
  type?: 'income' | 'expense'
}
