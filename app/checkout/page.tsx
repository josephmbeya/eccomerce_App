'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  Truck,
  CheckCircle
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatMWK } from '@/lib/payments'
import PaymentForm from '@/components/PaymentForm'
import toast from 'react-hot-toast'
import Loader from '@/components/Loader'

// Shipping methods for Malawi
const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivered to your doorstep',
    estimatedDays: '3-5 business days',
    price: 5000
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority delivery service',
    estimatedDays: '1-2 business days',
    price: 12000
  },
  {
    id: 'free',
    name: 'Free Delivery',
    description: 'Free delivery for orders over MWK 50,000',
    estimatedDays: '5-7 business days',
    price: 0
  }
]

interface Address {
  name: string
  street: string
  city: string
  state?: string
  zipCode?: string // We'll use this for phone number
  country: string
}

type CheckoutStep = 'shipping' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotalPrice, clearCart } = useCartStore()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null)
  const [billingAddress, setBillingAddress] = useState<Address | null>(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(SHIPPING_METHODS[0])
  const [orderNotes, setOrderNotes] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Form states
  const [shippingForm, setShippingForm] = useState<Partial<Address>>({})
  const [billingForm, setBillingForm] = useState<Partial<Address>>({})

  // Redirect if cart is empty - but wait for session to load first
  useEffect(() => {
    if (status === 'loading') return // Don't redirect while session is loading
    
    if (items.length === 0) {
      router.push('/')
      toast.error('Your cart is empty')
    }
  }, [items.length, router, status])

  // Require authentication - only check when session is loaded
  useEffect(() => {
    if (status === 'loading') return // Don't do anything while loading
    
    if (status === 'unauthenticated' || !session) {
      router.push('/')
      toast.error('Please login to continue with checkout')
    }
  }, [session, status, router])

  const cartTotal = getTotalPrice()
  const shippingCost = cartTotal >= 50000 && selectedShippingMethod.id === 'free' 
    ? 0 
    : selectedShippingMethod.price

  const steps = [
    { id: 'shipping', title: 'Shipping Info', icon: MapPin },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ]

  const handleShippingSubmit = () => {
    if (!shippingForm.name || !shippingForm.street || !shippingForm.city) {
      toast.error('Please fill in all required shipping fields')
      return
    }

    const address: Address = {
      name: shippingForm.name!,
      street: shippingForm.street!,
      city: shippingForm.city!,
      state: shippingForm.state || '',
      zipCode: shippingForm.zipCode || '',
      country: 'Malawi'
    }

    setShippingAddress(address)
    
    if (useSameAddress) {
      setBillingAddress(address)
    } else if (!billingForm.name || !billingForm.street || !billingForm.city) {
      toast.error('Please fill in billing address details')
      return
    } else {
      const billingAddr: Address = {
        name: billingForm.name!,
        street: billingForm.street!,
        city: billingForm.city!,
        state: billingForm.state || '',
        zipCode: billingForm.zipCode || '',
        country: 'Malawi'
      }
      setBillingAddress(billingAddr)
    }

    // Create order first, then proceed to payment
    createOrder()
  }

  const createOrder = async () => {
    if (!session?.user || !shippingAddress) return

    setIsProcessing(true)

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingName: shippingAddress.name,
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state || '',
        shippingZipCode: shippingAddress.zipCode || '',
        shippingCountry: shippingAddress.country,
        billingName: (billingAddress || shippingAddress).name,
        billingStreet: (billingAddress || shippingAddress).street,
        billingCity: (billingAddress || shippingAddress).city,
        billingState: (billingAddress || shippingAddress).state || '',
        billingZipCode: (billingAddress || shippingAddress).zipCode || '',
        billingCountry: (billingAddress || shippingAddress).country,
        shippingMethodId: selectedShippingMethod.id,
        shippingMethodName: selectedShippingMethod.name,
        shippingCost: shippingCost,
        paymentMethodId: 'pending',
        paymentMethodName: 'Pending Selection',
        paymentFee: 0,
        subtotal: cartTotal,
        total: cartTotal + shippingCost,
        notes: orderNotes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      setOrderId(order.id)
      setCurrentStep('payment')
      toast.success('Order created! Please complete payment.')

    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Payment completed successfully!')
    clearCart()
    setCurrentStep('confirmation')
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
  }

  const handleOrderComplete = () => {
    router.push(`/order-success?orderId=${orderId}`)
  }

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading checkout...</span>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or cart is empty
  if (!session || items.length === 0) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? "border-primary-500 bg-primary-500 text-white" 
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-px mx-4 ${
                      isCompleted 
                        ? "bg-green-500" 
                        : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Shipping Information
                </h2>
                
                <div className="space-y-6">
                  {/* Shipping Address Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={shippingForm.name || ''}
                          onChange={(e) => setShippingForm({...shippingForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={shippingForm.zipCode || ''}
                          onChange={(e) => setShippingForm({...shippingForm, zipCode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="+265 xxx xxx xxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.street || ''}
                        onChange={(e) => setShippingForm({...shippingForm, street: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your street address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City *
                        </label>
                        <select
                          value={shippingForm.city || ''}
                          onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select city</option>
                          <option value="Lilongwe">Lilongwe</option>
                          <option value="Blantyre">Blantyre</option>
                          <option value="Mzuzu">Mzuzu</option>
                          <option value="Zomba">Zomba</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Region
                        </label>
                        <input
                          type="text"
                          value={shippingForm.state || ''}
                          onChange={(e) => setShippingForm({...shippingForm, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Enter region (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Methods */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Delivery Method
                    </h3>
                    <div className="space-y-3">
                      {SHIPPING_METHODS.map((method) => {
                        const actualPrice = cartTotal >= 50000 && method.id === 'free' ? 0 : method.price
                        
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              selectedShippingMethod.id === method.id
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="shipping"
                                value={method.id}
                                checked={selectedShippingMethod.id === method.id}
                                onChange={() => setSelectedShippingMethod(method)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="ml-3">
                                <div className="flex items-center">
                                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {method.name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {method.description} • {method.estimatedDays}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {actualPrice === 0 ? 'Free' : formatMWK(actualPrice)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Billing Address Checkbox */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Billing address is the same as shipping address
                      </span>
                    </label>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Special delivery instructions, gift messages, etc."
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleShippingSubmit}
                      disabled={isProcessing}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Payment'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && orderId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Payment Information
                </h2>
                
                <PaymentForm
                  orderId={orderId}
                  orderTotal={cartTotal + shippingCost}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipping
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Order Confirmed!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for your purchase. Your order has been confirmed and will be processed soon.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
                    <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      {orderId?.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Delivery</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedShippingMethod.estimatedDays}
                    </p>
                  </div>

                  <button
                    onClick={handleOrderComplete}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Order Details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatMWK(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal ({items.length} items)
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatMWK(cartTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : formatMWK(shippingCost)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatMWK(cartTotal + shippingCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
