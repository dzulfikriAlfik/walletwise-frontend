/**
 * Login Page
 * User authentication login interface
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/card'
import { LocaleSelector } from '@/components/LocaleSelector'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { login, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      await login(formData)
      navigate('/dashboard')
    } catch (error: any) {
      if (error?.error?.details) {
        // Convert array errors to strings
        const details = error?.error?.details
        const formattedErrors: Record<string, string> = {}
        Object.keys(details).forEach((key) => {
          const errorValue = details[key]
          formattedErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue
        })
        setErrors(formattedErrors)
      } else {
        setErrors({
          general: error?.error?.message || t('auth.loginFailed'),
        })
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="absolute top-4 right-4">
        <LocaleSelector />
      </div>
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-muted-foreground">{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder')}
              required
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('common.signIn')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('common.signUp')}
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm font-medium text-foreground mb-2">{t('auth.demoAccount')}</p>
            <p className="text-xs text-muted-foreground">Email: demo@walletwise.com</p>
            <p className="text-xs text-muted-foreground">Password: Demo1234!</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
