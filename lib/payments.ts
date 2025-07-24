import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Payment method types for Malawi market
export type PaymentMethod = 
  | 'stripe_card'
  | 'airtel_money' 
  | 'tnm_mpamba'
  | 'cash_on_delivery'
  | 'bank_transfer'

export interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  description: string
  icon: string
  available: boolean
  processingFee?: number // percentage
}

// Available payment methods for Malawi
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'stripe_card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    available: true,
    processingFee: 2.9
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    description: 'Pay with your Airtel Money wallet',
    icon: '📱',
    available: true,
    processingFee: 1.5
  },
  {
    id: 'tnm_mpamba',
    name: 'TNM Mpamba',
    description: 'Pay with your TNM Mpamba wallet',
    icon: '💰',
    available: true,
    processingFee: 1.5
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: '💵',
    available: true,
    processingFee: 0
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer (Manual verification)',
    icon: '🏦',
    available: true,
    processingFee: 0
  }
]

// Currency formatting for MWK
export const formatMWK = (amount: number): string => {
  return new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Convert MWK to cents for Stripe (Stripe requires amounts in smallest currency unit)
export const mwkToCents = (amount: number): number => {
  // MWK doesn't have subunits, so 1 MWK = 100 cents for Stripe
  return Math.round(amount * 100)
}

// Convert cents back to MWK
export const centsToMwk = (cents: number): number => {
  return Math.round(cents / 100)
}

// Calculate processing fee
export const calculateProcessingFee = (amount: number, paymentMethod: PaymentMethod): number => {
  const method = PAYMENT_METHODS.find(m => m.id === paymentMethod)
  if (!method || !method.processingFee) return 0
  
  return Math.round(amount * (method.processingFee / 100))
}

// Calculate total with processing fee
export const calculateTotalWithFees = (amount: number, paymentMethod: PaymentMethod): number => {
  const fee = calculateProcessingFee(amount, paymentMethod)
  return amount + fee
}

// Validate Malawi phone number for mobile money
export const validateMalawiPhone = (phone: string): boolean => {
  // Malawi phone numbers: +265 followed by 9 digits
  const malawiPhoneRegex = /^(\+265|265|0)?[18][0-9]{8}$/
  return malawiPhoneRegex.test(phone.replace(/\s+/g, ''))
}

// Format Malawi phone number
export const formatMalawiPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  // Remove leading 265 or 0 if present
  let formatted = cleaned
  if (formatted.startsWith('265')) {
    formatted = formatted.substring(3)
  } else if (formatted.startsWith('0')) {
    formatted = formatted.substring(1)
  }
  
  // Add +265 prefix
  return `+265${formatted}`
}

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'processing' 
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface PaymentIntent {
  id: string
  orderId: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  processingFee: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Error handling for payments
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public paymentMethod?: PaymentMethod
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}

// Stripe error codes mapping
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'Your card\'s security code is incorrect.',
  insufficient_funds: 'Your card has insufficient funds.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  generic_decline: 'Your card was declined. Please try a different payment method.'
}
