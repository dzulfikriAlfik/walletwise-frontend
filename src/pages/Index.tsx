/**
 * Home/Landing Page
 */

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            WalletWise
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart Budgeting & Expense Tracking Made Simple
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
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
                Wallet Management
              </CardTitle>
              <CardDescription>
                Organize your finances with multiple wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create unlimited wallets to track different accounts, currencies, and financial goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Transaction Tracking
              </CardTitle>
              <CardDescription>
                Monitor every income and expense
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Categorize transactions, add notes, and get insights into your spending habits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Visualize your financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get real-time insights with beautiful charts and summaries of your finances.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Built with Modern Technologies</CardTitle>
              <CardDescription>
                Production-ready full-stack application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      React 19 + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Tailwind CSS + shadcn/ui
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      React Query + Zustand
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      React Router v7
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Backend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Node.js + Express + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      PostgreSQL + Prisma ORM
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      JWT Authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
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
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="py-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="text-blue-100 mb-6">
                Start tracking your expenses and building better financial habits today.
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
