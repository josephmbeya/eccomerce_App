'use client'

import { useState } from 'react'
import { X, Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { customToast } from '@/lib/toast'
import { useLoadingStates } from '@/lib/hooks/useLoadingStates'
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'
import { ButtonLoader } from '@/components/Loader'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  // Always call hooks at the top level
  const { isLoading, withLoading } = useLoadingStates()
  const { handleError } = useErrorHandler()

  if (!product || !isOpen) return null

  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0
  const images = product.images || [product.image]

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta))
  }

const handleAddToCart = async () => {
  const { addItem } = useCartStore.getState()

  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
    customToast.warning('Please select a size')
    return
  }

  if (product.colors && product.colors.length > 0 && !selectedColor) {
    customToast.warning('Please select a color')
    return
  }

  await withLoading(`add-to-cart-${product.id}`, async () => {
    try {
      addItem(product, quantity, selectedSize, selectedColor)
      customToast.success(`Added ${quantity} ${product.name} to cart!`)
    } catch (error) {
      handleError(error, 'Failed to add item to cart')
    }
  })
}

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300 dark:text-gray-600'
        )}
      />
    ))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative p-6">
              {/* Badge */}
              {product.badge && (
                <div className="absolute left-8 top-8 z-10">
                  <span className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    product.badge === 'Best Seller' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    product.badge === 'New' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                    product.badge === 'Sale' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    product.badge === 'Limited Edition' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  )}>
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="mt-4 flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'h-16 w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
                        selectedImageIndex === index && 'ring-2 ring-primary-500'
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col p-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>

                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-gray-500 line-through dark:text-gray-400">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Key Features:</h3>
                    <ul className="mt-2 space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Size</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                            selectedSize === size
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Color</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                            selectedColor === color
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quantity</h3>
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {product.stockCount && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {product.stockCount} in stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <div className="flex space-x-4">
<button
                    onClick={handleAddToCart}
                    disabled={isLoading(`add-to-cart-${product.id}`)}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading(`add-to-cart-${product.id}`) ? (
                      <>
                        <ButtonLoader size="sm" color="white" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(
                      'rounded-lg p-3 transition-colors',
                      isWishlisted
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
                  </button>
                </div>

                {/* Shipping Info */}
                <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Truck className="mr-2 h-4 w-4" />
                    Free shipping on orders over MWK 50,000
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Shield className="mr-2 h-4 w-4" />
                    2-year warranty included
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    30-day return policy
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
