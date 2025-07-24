import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'succeeded',
        metadata: JSON.stringify({
          ...JSON.parse(await getPaymentMetadata(paymentIntent.id) || '{}'),
          stripePaymentMethod: paymentIntent.payment_method,
          completedAt: new Date().toISOString()
        })
      }
    })

    // Update order status
    const orderId = paymentIntent.metadata.orderId
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'paid',
          updatedAt: new Date()
        }
      })
    }

    console.log(`Payment succeeded for order: ${orderId}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const lastPaymentError = paymentIntent.last_payment_error

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'failed',
        failureCode: lastPaymentError?.code || 'unknown',
        failureMessage: lastPaymentError?.message || 'Payment failed',
        metadata: JSON.stringify({
          ...JSON.parse(await getPaymentMetadata(paymentIntent.id) || '{}'),
          failedAt: new Date().toISOString(),
          stripeError: lastPaymentError
        })
      }
    })

    console.log(`Payment failed for payment intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'cancelled',
        metadata: JSON.stringify({
          ...JSON.parse(await getPaymentMetadata(paymentIntent.id) || '{}'),
          cancelledAt: new Date().toISOString()
        })
      }
    })

    console.log(`Payment canceled for payment intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'processing',
        metadata: JSON.stringify({
          ...JSON.parse(await getPaymentMetadata(paymentIntent.id) || '{}'),
          processingStartedAt: new Date().toISOString()
        })
      }
    })

    console.log(`Payment processing for payment intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment processing:', error)
  }
}

async function getPaymentMetadata(stripePaymentIntentId: string): Promise<string | null> {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId },
    select: { metadata: true }
  })
  return payment?.metadata || null
}
