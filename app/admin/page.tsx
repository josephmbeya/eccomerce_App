'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  TrendingUp,
  Eye,
  DollarSign,
  ArrowLeft,
  Home
} from 'lucide-react'
import DashboardStats from '@/components/admin/DashboardStats'
import ProductManagement from '@/components/admin/ProductManagement'
import OrderManagement from '@/components/admin/OrderManagement'
import UserManagement from '@/components/admin/UserManagement'
import AdminSettings from '@/components/admin/AdminSettings'
import { ADMIN_EMAILS } from '@/lib/admin'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/api/auth/signin?callbackUrl=/admin')
      return
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user?.email || '')) {
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
    return null
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                TISHOPE Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-MW', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-sm h-screen sticky top-0">
          <div className="p-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && <DashboardStats />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  )
}
