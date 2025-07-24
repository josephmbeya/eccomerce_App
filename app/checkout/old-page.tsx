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
  Phone,
  Banknote
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useCheckoutStore, SHIPPING_METHODS, PAYMENT_METHODS } from '@/store/checkout'
import { formatPrice, cn } from '@/lib/utils'
import { Address } from '@/lib/types'
import PaymentForm from '@/components/PaymentForm'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, openAuthModal } = useAuthStore()
  const {
    currentStep,
    shippingAddress,
    billingAddress,
    useSameAddress,
    shippingMethod,
    paymentMethod,
    orderNotes,
    isProcessing,
    setCurrentStep,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setShippingMethod,
    setPaymentMethod,
    setOrderNotes,
    setIsProcessing,
    resetCheckout,
    getShippingCost,
    getPaymentFee
  } = useCheckoutStore()

  const [shippingForm, setShippingForm] = useState<Partial<Address>>({})
  const [billingForm, setBillingForm] = useState<Partial<Address>>({})

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
      toast.error('Your cart is empty')
    }
  }, [items.length, router])

  // Require authentication
  useEffect(() => {
    if (!user) {
      openAuthModal('login')
      router.push('/')
      toast.error('Please login to continue with checkout')
    }
  }, [user, openAuthModal, router])

  const cartTotal = getTotalPrice()
  const shippingCost = getShippingCost()
  const paymentFee = paymentMethod?.type === 'card' 
    ? Math.round(cartTotal * 0.03) // 3% card fee
    : getPaymentFee()
  const finalTotal = cartTotal + shippingCost + paymentFee

  const steps = [
    { id: 'shipping', title: 'Shipping', icon: MapPin },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'review', title: 'Review', icon: ShoppingBag }
  ]

  const handleShippingSubmit = () => {
    if (!shippingForm.name || !shippingForm.street || !shippingForm.city) {
      toast.error('Please fill in all required shipping fields')
      return
    }

    const address: Address = {
      id: Date.now().toString(),
      type: 'home',
      name: shippingForm.name!,
      street: shippingForm.street!,
      city: shippingForm.city!,
      state: shippingForm.state || '',
      zipCode: shippingForm.zipCode || '',
      country: 'Malawi',
      isDefault: true
    }

    setShippingAddress(address)
    
    if (useSameAddress) {
      setBillingAddress(address)
    } else if (!billingForm.name || !billingForm.street || !billingForm.city) {
      toast.error('Please fill in billing address details')
      return
    } else {
      const billingAddr: Address = {
        id: Date.now().toString() + '-billing',
        type: 'home',
        name: billingForm.name!,
        street: billingForm.street!,
        city: billingForm.city!,
        state: billingForm.state || '',
        zipCode: billingForm.zipCode || '',
        country: 'Malawi'
      }
      setBillingAddress(billingAddr)
    }

    setCurrentStep('payment')
  }

  const handlePaymentSubmit = () => {
    if (!shippingMethod) {
      toast.error('Please select a shipping method')
      return
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    if (!user || !shippingAddress || !shippingMethod || !paymentMethod) {
      toast.error('Missing required information')
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        userId: user.id,
        items,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        shippingMethod,
        paymentMethod,
        orderNotes,
        cartTotal,
        shippingCost,
        paymentFee,
        finalTotal
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

      // Clear cart and reset checkout
      clearCart()
      resetCheckout()

      // Redirect to success page
      router.push(`/order-success?orderId=${order.id}`)
      toast.success('Order placed successfully!')

    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user || items.length === 0) return null

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
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isActive 
                      ? "border-primary-500 bg-primary-500 text-white" 
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "ml-3 text-sm font-medium",
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-12 h-px mx-4",
                      isCompleted 
                        ? "bg-green-500" 
                        : "bg-gray-300 dark:bg-gray-600"
                    )} />
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

                  {/* Billing Address Option */}
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

                  {/* Billing Address Form (if different) */}
                  {!useSameAddress && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Billing Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={billingForm.name || ''}
                              onChange={(e) => setBillingForm({...billingForm, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={billingForm.street || ''}
                            onChange={(e) => setBillingForm({...billingForm, street: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City *
                          </label>
                          <select
                            value={billingForm.city || ''}
                            onChange={(e) => setBillingForm({...billingForm, city: e.target.value})}
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
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleShippingSubmit}
                      className="btn-primary flex items-center"
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Shipping & Payment
                </h2>

                {/* Shipping Methods */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Shipping Method
                  </h3>
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors",
                          shippingMethod?.id === method.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod?.id === method.id}
                            onChange={() => setShippingMethod(method)}
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
                          {method.price === 0 ? 'Free' : formatPrice(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors",
                          paymentMethod?.id === method.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod?.id === method.id}
                            onChange={() => setPaymentMethod(method)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3">
                            <div className="flex items-center">
                              {method.type === 'mobile_money' && <Phone className="h-4 w-4 text-gray-400 mr-2" />}
                              {method.type === 'card' && <CreditCard className="h-4 w-4 text-gray-400 mr-2" />}
                              {method.type === 'cod' && <Banknote className="h-4 w-4 text-gray-400 mr-2" />}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {method.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {method.fee && method.fee > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            +{formatPrice(method.fee)} fee
                          </span>
                        )}
                        {method.type === 'card' && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            3% processing fee
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Order Notes (Optional)
                  </h3>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Special delivery instructions, gift messages, etc."
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="btn-secondary flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    className="btn-primary flex items-center"
                  >
                    Review Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Review Your Order
                </h2>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {shippingAddress?.name}<br />
                    {shippingAddress?.street}<br />
                    {shippingAddress?.city}, {shippingAddress?.country}
                    {shippingAddress?.zipCode && <><br />Phone: {shippingAddress.zipCode}</>}
                  </p>
                </div>

                {/* Shipping Method */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Shipping Method
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {shippingMethod?.name} - {shippingMethod?.estimatedDays}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Payment Method
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {paymentMethod?.name}
                  </p>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="btn-secondary flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                    <ArrowRight className="ml-2 h-4 w-4" />
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

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal ({items.length} items)
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>

                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Fee</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPrice(paymentFee)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatPrice(finalTotal)}
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
