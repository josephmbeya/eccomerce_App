'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Star
} from 'lucide-react'

interface DashboardData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueGrowth: number
  orderGrowth: number
  customerGrowth: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      name: 'Total Revenue',
      value: `MWK ${data.totalRevenue.toLocaleString()}`,
      change: data.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      name: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      change: data.orderGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      name: 'Customers',
      value: data.totalCustomers.toLocaleString(),
      change: data.customerGrowth,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      name: 'Products',
      value: data.totalProducts.toLocaleString(),
      change: 0,
      icon: Package,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0
          const TrendIcon = isPositive ? TrendingUp : TrendingDown
          
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              
              {stat.change !== 0 && (
                <div className="mt-4 flex items-center">
                  <TrendIcon className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Selling Products
            </h3>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      MWK {product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Orders
            </h3>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      MWK {order.total.toLocaleString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : order.status === 'delivered'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
