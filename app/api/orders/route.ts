import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
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
      shippingCost,
      // Payment method
      paymentMethodId,
      paymentMethodName,
      paymentFee,
      // Pricing
      subtotal,
      total,
      notes
    } = body

    // Validation
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'No items in order' }, 
        { status: 400 }
      )
    }

    if (!shippingName || !shippingStreet || !shippingCity || !shippingMethodId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required order information' }, 
        { status: 400 }
      )
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'pending',
        
        // Order items as JSON
        items: JSON.stringify(items),
        
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
        shippingMethodName,
        shippingCost,
        
        // Payment method
        paymentMethodId,
        paymentMethodName,
        paymentFee: paymentFee || 0,
        
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

  } catch (error) {
    console.error('Order creation error:', error)
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
