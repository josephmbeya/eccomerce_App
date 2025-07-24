import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { 
  PaymentMethod, 
  validateMalawiPhone, 
  formatMalawiPhone,
  calculateTotalWithFees 
} from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      orderId, 
      paymentMethod, 
      mobileMoneyPhone,
      bankTransferBank,
      bankTransferReference 
    } = await request.json()

    if (!orderId || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Order ID and payment method are required' 
      }, { status: 400 })
    }

    // Validate payment method
    const validMethods: PaymentMethod[] = [
      'airtel_money', 
      'tnm_mpamba', 
      'cash_on_delivery', 
      'bank_transfer'
    ]
    
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ 
        error: 'Invalid payment method' 
      }, { status: 400 })
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

    // Validate mobile money phone number if required
    if ((paymentMethod === 'airtel_money' || paymentMethod === 'tnm_mpamba')) {
      if (!mobileMoneyPhone) {
        return NextResponse.json({ 
          error: 'Mobile money phone number is required' 
        }, { status: 400 })
      }

      if (!validateMalawiPhone(mobileMoneyPhone)) {
        return NextResponse.json({ 
          error: 'Invalid Malawi phone number format' 
        }, { status: 400 })
      }
    }

    // Validate bank transfer details if required
    if (paymentMethod === 'bank_transfer') {
      if (!bankTransferBank || !bankTransferReference) {
        return NextResponse.json({ 
          error: 'Bank name and reference number are required for bank transfer' 
        }, { status: 400 })
      }
    }

    // Calculate total with processing fees
    const totalWithFees = calculateTotalWithFees(order.total, paymentMethod)
    const processingFee = totalWithFees - order.total

    // Create payment record
    const paymentData: any = {
      orderId: order.id,
      amount: totalWithFees,
      currency: 'MWK',
      paymentMethod,
      processingFee,
      metadata: JSON.stringify({
        originalAmount: order.total,
        createdAt: new Date().toISOString()
      })
    }

    // Add method-specific data
    if (paymentMethod === 'airtel_money' || paymentMethod === 'tnm_mpamba') {
      paymentData.mobileMoneyPhone = formatMalawiPhone(mobileMoneyPhone)
      paymentData.status = 'pending' // Will be updated when payment is verified
      
      // Generate a reference number for mobile money
      const reference = `TH${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      paymentData.mobileMoneyReference = reference
      
      paymentData.metadata = JSON.stringify({
        ...JSON.parse(paymentData.metadata),
        reference,
        instructions: `Please send MWK ${totalWithFees.toLocaleString()} to the merchant account and use reference: ${reference}`
      })
    }

    if (paymentMethod === 'bank_transfer') {
      paymentData.bankTransferBank = bankTransferBank
      paymentData.bankTransferReference = bankTransferReference
      paymentData.status = 'pending' // Will be verified manually
      
      paymentData.metadata = JSON.stringify({
        ...JSON.parse(paymentData.metadata),
        instructions: 'Payment pending manual verification. You will receive confirmation once the transfer is verified.'
      })
    }

    if (paymentMethod === 'cash_on_delivery') {
      paymentData.status = 'pending'
      paymentData.metadata = JSON.stringify({
        ...JSON.parse(paymentData.metadata),
        instructions: 'Payment will be collected upon delivery of your order.'
      })
    }

    const payment = await prisma.payment.create({
      data: paymentData
    })

    // Update order payment method
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethodId: paymentMethod,
        paymentMethodName: getPaymentMethodName(paymentMethod),
        paymentFee: processingFee,
        total: totalWithFees // Update total to include fees
      }
    })

    // Prepare response based on payment method
    const response: any = {
      paymentId: payment.id,
      status: payment.status,
      amount: totalWithFees,
      processingFee,
      paymentMethod
    }

    if (paymentMethod === 'airtel_money' || paymentMethod === 'tnm_mpamba') {
      response.reference = paymentData.mobileMoneyReference
      response.phone = paymentData.mobileMoneyPhone
      response.instructions = `Send MWK ${totalWithFees.toLocaleString()} to the merchant account using reference: ${paymentData.mobileMoneyReference}`
    }

    if (paymentMethod === 'bank_transfer') {
      response.instructions = 'Payment pending manual verification. You will receive confirmation once the transfer is verified.'
    }

    if (paymentMethod === 'cash_on_delivery') {
      response.instructions = 'Payment will be collected upon delivery of your order.'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Local payment error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

function getPaymentMethodName(method: PaymentMethod): string {
  const names = {
    airtel_money: 'Airtel Money',
    tnm_mpamba: 'TNM Mpamba',
    cash_on_delivery: 'Cash on Delivery',
    bank_transfer: 'Bank Transfer',
    stripe_card: 'Credit/Debit Card'
  }
  return names[method] || method
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: { userId: true }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify the payment belongs to the current user
    if (payment.order.userId !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      processingFee: payment.processingFee,
      createdAt: payment.createdAt,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : null
    })

  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}
