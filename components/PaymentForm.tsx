'use client'

import { useState, useEffect } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { 
  PAYMENT_METHODS, 
  PaymentMethod, 
  formatMWK, 
  calculateTotalWithFees,
  validateMalawiPhone,
  formatMalawiPhone 
} from '@/lib/payments'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  orderId: string
  orderTotal: number
  onPaymentSuccess: (paymentId: string) => void
  onPaymentError: (error: string) => void
}

export default function PaymentForm({ 
  orderId, 
  orderTotal, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe_card')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Local payment method states
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('')
  const [bankTransferBank, setBankTransferBank] = useState('')
  const [bankTransferReference, setBankTransferReference] = useState('')

  const totalWithFees = calculateTotalWithFees(orderTotal, selectedMethod)
  const processingFee = totalWithFees - orderTotal

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      if (selectedMethod === 'stripe_card') {
        // Handle Stripe payment - will be handled by StripePaymentForm
        return
      }
      
      // Handle local payment methods
      const requestBody: any = {
        orderId,
        paymentMethod: selectedMethod
      }

      if (selectedMethod === 'airtel_money' || selectedMethod === 'tnm_mpamba') {
        if (!mobileMoneyPhone) {
          toast.error('Please enter your mobile money phone number')
          return
        }
        
        if (!validateMalawiPhone(mobileMoneyPhone)) {
          toast.error('Please enter a valid Malawi phone number')
          return
        }
        
        requestBody.mobileMoneyPhone = mobileMoneyPhone
      }

      if (selectedMethod === 'bank_transfer') {
        if (!bankTransferBank || !bankTransferReference) {
          toast.error('Please provide bank details and reference number')
          return
        }
        
        requestBody.bankTransferBank = bankTransferBank
        requestBody.bankTransferReference = bankTransferReference
      }

      const response = await fetch('/api/payments/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed')
      }

      toast.success('Payment initiated successfully!')
      
      if (result.instructions) {
        toast.success(result.instructions, { duration: 8000 })
      }

      onPaymentSuccess(result.paymentId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Payment Method
        </h3>
        <div className="space-y-3">
          {PAYMENT_METHODS.filter(method => method.available).map((method) => {
            const Icon = getPaymentIcon(method.id)
            const total = calculateTotalWithFees(orderTotal, method.id)
            const fee = total - orderTotal
            
            return (
              <label
                key={method.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:border-primary-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                  className="sr-only"
                />
                
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedMethod === method.id 
                        ? 'bg-primary-100 dark:bg-primary-800' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        selectedMethod === method.id 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </h4>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatMWK(total)}
                        </div>
                        {fee > 0 && (
                          <div className="text-xs text-gray-500">
                            +{formatMWK(fee)} fee
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Payment Method Specific Forms */}
      {selectedMethod === 'stripe_card' && (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            orderId={orderId}
            amount={totalWithFees}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </Elements>
      )}

      {(selectedMethod === 'airtel_money' || selectedMethod === 'tnm_mpamba') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Money Phone Number
            </label>
            <input
              type="tel"
              value={mobileMoneyPhone}
              onChange={(e) => setMobileMoneyPhone(e.target.value)}
              placeholder="+265 8XX XXX XXX"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your {selectedMethod === 'airtel_money' ? 'Airtel Money' : 'TNM Mpamba'} phone number
            </p>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={isProcessing || !mobileMoneyPhone}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay {formatMWK(totalWithFees)}
              </>
            )}
          </button>
        </div>
      )}

      {selectedMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bank Name
            </label>
            <select
              value={bankTransferBank}
              onChange={(e) => setBankTransferBank(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select your bank</option>
              <option value="National Bank of Malawi">National Bank of Malawi</option>
              <option value="Standard Bank">Standard Bank</option>
              <option value="FDH Bank">FDH Bank</option>
              <option value="NBS Bank">NBS Bank</option>
              <option value="MyBucks Banking Corporation">MyBucks Banking Corporation</option>
              <option value="CDH Investment Bank">CDH Investment Bank</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Reference Number
            </label>
            <input
              type="text"
              value={bankTransferReference}
              onChange={(e) => setBankTransferReference(e.target.value)}
              placeholder="Enter your transaction reference"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Reference number from your bank transfer receipt
            </p>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={isProcessing || !bankTransferBank || !bankTransferReference}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Payment {formatMWK(totalWithFees)}
              </>
            )}
          </button>
        </div>
      )}

      {selectedMethod === 'cash_on_delivery' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Cash on Delivery</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You will pay {formatMWK(totalWithFees)} when your order is delivered to you.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Order - Pay on Delivery
              </>
            )}
          </button>
        </div>
      )}

      {/* Processing Fee Info */}
      {processingFee > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            A processing fee of {formatMWK(processingFee)} will be added to your total.
          </p>
        </div>
      )}
    </div>
  )
}

// Stripe Payment Form Component
interface StripePaymentFormProps {
  orderId: string
  amount: number
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  onPaymentSuccess: (paymentId: string) => void
  onPaymentError: (error: string) => void
}

function StripePaymentForm({
  orderId,
  amount,
  isProcessing,
  setIsProcessing,
  onPaymentSuccess,
  onPaymentError
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create payment intent')
        }

        setClientSecret(result.clientSecret)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment'
        toast.error(errorMessage)
        onPaymentError(errorMessage)
      }
    }

    createPaymentIntent()
  }, [orderId])

  const handleStripePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment system not ready. Please try again.')
      return
    }

    setIsProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!')
        onPaymentSuccess(paymentIntent.id)
      } else {
        throw new Error('Payment was not completed')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Initializing payment...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Information
        </label>
        <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <button
        onClick={handleStripePayment}
        disabled={isProcessing || !stripe}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            Pay {formatMWK(amount)}
          </>
        )}
      </button>
    </div>
  )
}

// Helper function to get payment method icons
function getPaymentIcon(method: PaymentMethod) {
  const icons = {
    stripe_card: CreditCard,
    airtel_money: Smartphone,
    tnm_mpamba: Smartphone,
    cash_on_delivery: Banknote,
    bank_transfer: Building
  }
  return icons[method] || CreditCard
}
