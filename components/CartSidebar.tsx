'use client'

import { Fragment } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import { customToast } from '@/lib/toast'
import { useLoadingStates } from '@/lib/hooks/useLoadingStates'
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'
import { ButtonLoader } from '@/components/Loader'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function CartSidebar() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()
  const { isLoading, withLoading } = useLoadingStates()
  const { handleError } = useErrorHandler()
  
  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  
  const handleCheckout = async () => {
    if (items.length === 0) {
      customToast.warning('Your cart is empty')
      return
    }
    
    if (!session) {
      customToast.error('Please sign in to continue')
      toggleCart()
      return
    }
    
    await withLoading('checkout', async () => {
      try {
        toggleCart()
        router.push('/checkout')
        customToast.success('Redirecting to checkout...')
      } catch (error) {
        handleError(error, 'Failed to proceed to checkout')
      }
    })
  }
  
  const handleRemoveItem = async (itemId: string, itemName: string) => {
    await withLoading(`remove-${itemId}`, async () => {
      try {
        removeItem(itemId)
        customToast.success(`Removed ${itemName} from cart`)
      } catch (error) {
        handleError(error, 'Failed to remove item')
      }
    })
  }
  
  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    await withLoading(`update-${itemId}`, async () => {
      try {
        updateQuantity(itemId, newQuantity)
      } catch (error) {
        handleError(error, 'Failed to update quantity')
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={toggleCart}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Add some products to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-start space-x-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(item.product.price)}
                      </p>
                      
                      {/* Size and Color */}
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>•</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          disabled={item.quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              {/* Total */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Shipping and taxes calculated at checkout
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  disabled={isLoading('checkout')}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('checkout') ? (
                    <>
                      <ButtonLoader size="sm" color="white" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                <button 
                  onClick={toggleCart}
                  className="w-full btn-secondary"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
