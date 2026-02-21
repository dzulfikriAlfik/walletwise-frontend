/**
 * Home/Landing Page
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LocaleSelector } from '@/components/LocaleSelector'

export default function Index() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header with locale selector */}
      <div className="flex justify-end p-4">
        <LocaleSelector />
      </div>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8">
                {t('home.getStarted')}
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                {t('home.signIn')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                {t('home.feature1Title')}
              </CardTitle>
              <CardDescription>
                {t('home.feature1Desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.feature1Content')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {t('home.feature2Title')}
              </CardTitle>
              <CardDescription>
                {t('home.feature2Desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.feature2Content')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                {t('home.feature3Title')}
              </CardTitle>
              <CardDescription>
                {t('home.feature3Desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.feature3Content')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('home.techTitle')}</CardTitle>
              <CardDescription>
                {t('home.techDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">{t('home.frontend')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      React 19 + TypeScript
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      Tailwind CSS
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      React Query + Zustand
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      React Router v7
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">{t('home.backend')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      Node.js + Express + TypeScript
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      PostgreSQL + Prisma ORM
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      JWT Authentication
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-success">✓</span>
                      RESTful API Design
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
            <CardContent className="py-8">
              <h2 className="text-3xl font-bold mb-4">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                {t('home.ctaSubtitle')}
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="px-8 bg-white/20 hover:bg-white/30 text-white border-white/30">
                  {t('home.ctaButton')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
