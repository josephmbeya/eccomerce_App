import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { products } from '@/lib/products'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' }, 
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      items,
      // Shipping details (individual fields)
      shippingName,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
      // Billing details (individual fields)
      billingName,
      billingStreet,
      billingCity,
      billingState,
      billingZipCode,
      billingCountry,
      // Shipping method
      shippingMethodId,
      shippingMethodName,
      // Payment method
      paymentMethodId,
      paymentMethodName,
      paymentFee,
      notes
    } = body

    // Validation
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { error: 'No items in order' }, 
        { status: 400 }
      )
    }

    if (!shippingName || !shippingStreet || !shippingCity || !shippingCountry || !billingName || !billingStreet || !billingCity || !billingCountry || !shippingMethodId) {
      return NextResponse.json(
        { error: 'Missing required order information' }, 
        { status: 400 }
      )
    }

    const shippingMethods: Record<string, { name: string; price: number }> = {
      standard: { name: 'Standard Delivery', price: 5000 },
      express: { name: 'Express Delivery', price: 12000 },
      free: { name: 'Free Delivery', price: 0 },
    }
    const shippingMethod = shippingMethods[shippingMethodId]
    if (!shippingMethod) {
      return NextResponse.json({ error: 'Invalid shipping method' }, { status: 400 })
    }

    const normalizedItems = items.map((item: any) => {
      const product = products.find(candidate => candidate.id === item?.productId)
      const quantity = Number(item?.quantity)
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !product.inStock || (product.stockCount !== undefined && quantity > product.stockCount)) return null
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity,
        ...(typeof item.size === 'string' ? { size: item.size } : {}),
        ...(typeof item.color === 'string' ? { color: item.color } : {}),
      }
    })
    if (normalizedItems.some((item: unknown) => item === null)) {
      return NextResponse.json({ error: 'Invalid product or quantity in order' }, { status: 400 })
    }
    const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shippingCost = shippingMethodId === 'free' && subtotal >= 50000 ? 0 : shippingMethod.price
    const total = subtotal + shippingCost

    // Create order using server-side catalog prices and shipping rates.
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'pending',
        
        // Order items as JSON
        items: JSON.stringify(normalizedItems),
        
        // Shipping details
        shippingName,
        shippingStreet,
        shippingCity,
        shippingState: shippingState || '',
        shippingZipCode: shippingZipCode || '',
        shippingCountry,
        
        // Billing details
        billingName,
        billingStreet,
        billingCity,
        billingState: billingState || '',
        billingZipCode: billingZipCode || '',
        billingCountry,
        
        // Shipping method
        shippingMethodId,
        shippingMethodName: shippingMethod.name,
        shippingCost,
        
        // Payment method
        paymentMethodId: 'pending',
        paymentMethodName: 'Pending Selection',
        paymentFee: 0,
        
        // Pricing
        subtotal,
        total,
        
        // Optional notes
        notes: notes || null,
      }
    })

    // Return the created order
    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'User not found. Please sign in again.', 
          code: 'USER_NOT_FOUND' 
        }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        items: true,
        shippingMethodName: true,
        paymentMethodName: true
      }
    })

    // Parse items JSON for each order
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items as string)
    }))

    return NextResponse.json(ordersWithParsedItems)

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    )
  }
}
