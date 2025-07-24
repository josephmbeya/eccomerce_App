import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { mwkToCents, calculateTotalWithFees } from '@/lib/payments'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get the order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify the order belongs to the current user
    if (order.userId !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate the total with Stripe processing fees
    const totalWithFees = calculateTotalWithFees(order.total, 'stripe_card')
    const amountInCents = mwkToCents(totalWithFees)

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // Stripe doesn't support MWK, so we'll use USD as base
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        userId: order.userId,
        originalAmount: order.total.toString(),
        currency: 'MWK',
        processingFee: (totalWithFees - order.total).toString()
      },
      description: `TISHOPE Order ${order.id.slice(-8)}`
    })

    // Create payment record in our database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: totalWithFees,
        currency: 'MWK',
        paymentMethod: 'stripe_card',
        status: 'pending',
        processingFee: totalWithFees - order.total,
        metadata: JSON.stringify({
          stripeAmount: amountInCents,
          stripeCurrency: 'usd'
        })
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: payment.id,
      amount: totalWithFees,
      processingFee: totalWithFees - order.total
    })

  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
