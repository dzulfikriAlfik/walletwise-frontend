/**
 * Validation utilities
 * Pure validation functions
 */

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return minLength && hasUpperCase && hasLowerCase && hasNumber
}

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0
}

/**
 * Validate amount (must be positive number)
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0
}

/**
 * Validate wallet name
 */
export const isValidWalletName = (name: string): boolean => {
  return !isEmpty(name) && name.length >= 3 && name.length <= 50
}

/**
 * Validate transaction description
 */
export const isValidDescription = (description: string): boolean => {
  return !isEmpty(description) && description.length <= 200
}

/**
 * Get password strength
 */
export const getPasswordStrength = (
  password: string
): 'weak' | 'medium' | 'strong' => {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  return 'strong'
}
