import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Address } from '@/lib/types'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'mobile_money' | 'cod'
  name: string
  description: string
  fee?: number
}

interface CheckoutState {
  // Step tracking
  currentStep: 'shipping' | 'payment' | 'review'
  
  // Shipping information
  shippingAddress: Address | null
  billingAddress: Address | null
  useSameAddress: boolean
  shippingMethod: ShippingMethod | null
  
  // Payment information
  paymentMethod: PaymentMethod | null
  
  // Order notes
  orderNotes: string
  
  // Loading states
  isProcessing: boolean
  
  // Actions
  setCurrentStep: (step: 'shipping' | 'payment' | 'review') => void
  setShippingAddress: (address: Address) => void
  setBillingAddress: (address: Address) => void
  setUseSameAddress: (use: boolean) => void
  setShippingMethod: (method: ShippingMethod) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setOrderNotes: (notes: string) => void
  setIsProcessing: (processing: boolean) => void
  resetCheckout: () => void
  
  // Computed values
  getShippingCost: () => number
  getPaymentFee: () => number
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within Lilongwe and Blantyre',
    price: 5000, // MWK 5,000
    estimatedDays: '3-5 business days'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Next-day delivery in major cities',
    price: 12000, // MWK 12,000
    estimatedDays: '1-2 business days'
  },
  {
    id: 'pickup',
    name: 'Store Pickup',
    description: 'Pick up from our Lilongwe store',
    price: 0,
    estimatedDays: 'Available immediately'
  }
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'airtel_money',
    type: 'mobile_money',
    name: 'Airtel Money',
    description: 'Pay with your Airtel Money account'
  },
  {
    id: 'tnm_mpamba',
    type: 'mobile_money',
    name: 'TNM Mpamba',
    description: 'Pay with your TNM Mpamba account'
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard accepted',
    fee: 0 // 3% fee will be calculated
  },
  {
    id: 'cod',
    type: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    fee: 2000 // MWK 2,000 COD fee
  }
]

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'shipping',
      shippingAddress: null,
      billingAddress: null,
      useSameAddress: true,
      shippingMethod: null,
      paymentMethod: null,
      orderNotes: '',
      isProcessing: false,
      
      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setShippingAddress: (address) => set({ 
        shippingAddress: address,
        billingAddress: get().useSameAddress ? address : get().billingAddress
      }),
      
      setBillingAddress: (address) => set({ billingAddress: address }),
      
      setUseSameAddress: (use) => set({ 
        useSameAddress: use,
        billingAddress: use ? get().shippingAddress : get().billingAddress
      }),
      
      setShippingMethod: (method) => set({ shippingMethod: method }),
      
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      
      setOrderNotes: (notes) => set({ orderNotes: notes }),
      
      setIsProcessing: (processing) => set({ isProcessing: processing }),
      
      resetCheckout: () => set({
        currentStep: 'shipping',
        shippingAddress: null,
        billingAddress: null,
        useSameAddress: true,
        shippingMethod: null,
        paymentMethod: null,
        orderNotes: '',
        isProcessing: false,
      }),
      
      // Computed values
      getShippingCost: () => get().shippingMethod?.price || 0,
      
      getPaymentFee: () => {
        const method = get().paymentMethod
        if (!method) return 0
        
        // Calculate 3% fee for card payments
        if (method.type === 'card') {
          // This would typically be calculated based on cart total
          return 0 // We'll calculate this in the component
        }
        
        return method.fee || 0
      }
    }),
    {
      name: 'tishope-checkout-storage',
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        useSameAddress: state.useSameAddress,
        orderNotes: state.orderNotes,
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          try {
            const item = localStorage.getItem(name)
            return item ? JSON.parse(item) : null
          } catch (error) {
            console.warn('Failed to parse checkout storage:', error)
            localStorage.removeItem(name)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.warn('Failed to save checkout storage:', error)
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      },
    }
  )
)

