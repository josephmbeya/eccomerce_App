import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { products } from '@/lib/products'
import { ADMIN_EMAILS } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !ADMIN_EMAILS.includes(session.user?.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date for calculations
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get total revenue
    const allOrders = await prisma.order.findMany({
      select: {
        total: true,
        createdAt: true
      }
    })

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)
    
    // Get current month revenue
    const currentMonthOrders = allOrders.filter(order => 
      order.createdAt >= currentMonth
    )
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0)

    // Get last month revenue
    const lastMonthOrders = allOrders.filter(order => 
      order.createdAt >= lastMonth && order.createdAt <= lastMonthEnd
    )
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total, 0)

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    const orderGrowth = lastMonthOrders.length > 0 
      ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 
      : 0

    // Get total customers
    const totalCustomers = await prisma.user.count()
    
    // Get customer growth (simplified)
    const customerGrowth = Math.floor(Math.random() * 20) // Mock data for now

    // Get recent orders with user info
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Mock top products data (you can enhance this with real sales data)
    const topProducts = [
      {
        id: '1',
        name: 'Premium Cotton T-Shirt',
        sales: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 1000000) + 500000
      },
      {
        id: '2', 
        name: 'Wireless Bluetooth Headphones',
        sales: Math.floor(Math.random() * 30) + 15,
        revenue: Math.floor(Math.random() * 2000000) + 1000000
      },
      {
        id: '3',
        name: 'Designer Leather Handbag', 
        sales: Math.floor(Math.random() * 20) + 10,
        revenue: Math.floor(Math.random() * 3000000) + 2000000
      },
      {
        id: '4',
        name: 'Smart Fitness Watch',
        sales: Math.floor(Math.random() * 25) + 12,
        revenue: Math.floor(Math.random() * 1500000) + 800000
      },
    ].sort((a, b) => b.revenue - a.revenue)

    const dashboardData = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders: allOrders.length,
      totalCustomers,
      totalProducts: products.length,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      customerGrowth: Math.round(customerGrowth * 10) / 10,
      topProducts,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customerName: order.shippingName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString()
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
