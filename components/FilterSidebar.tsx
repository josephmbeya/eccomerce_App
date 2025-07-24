'use client'

import { useState } from 'react'
import { 
  Filter, 
  X, 
  Star, 
  Check, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Package,
  Tag
} from 'lucide-react'
import { useSearchStore } from '@/store/search'
import { categories } from '@/lib/products'
import { formatPrice, cn } from '@/lib/utils'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-900 dark:text-white"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({ isOpen, onClose, className }: FilterSidebarProps) {
  const {
    selectedCategory,
    priceRange,
    selectedRating,
    selectedColors,
    selectedSizes,
    inStockOnly,
    onSaleOnly,
    setCategory,
    setPriceRange,
    setRating,
    toggleColor,
    toggleSize,
    setInStockOnly,
    setOnSaleOnly,
    clearFilters,
    totalResults
  } = useSearchStore()
  
  const [tempPriceRange, setTempPriceRange] = useState(priceRange)
  
  // Sample data - in a real app, this might come from your products or API
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Brown', 'Green', 'Navy', 'Tan', 'Rose Gold', 'Silver']
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const ratingOptions = [5, 4, 3, 2, 1]
  
  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0
    setTempPriceRange(prev => ({ ...prev, [field]: numValue }))
  }
  
  const applyPriceRange = () => {
    setPriceRange(tempPriceRange)
  }
  
  const hasActiveFilters = 
    selectedCategory !== 'all' ||
    priceRange.min > 0 ||
    priceRange.max < 1000000 ||
    selectedRating > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    inStockOnly ||
    onSaleOnly
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        'fixed left-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-900 lg:relative lg:translate-x-0 lg:shadow-none',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              {totalResults > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {totalResults}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Filter */}
            <FilterSection title="Category">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'all'}
                    onChange={() => setCategory('all')}
                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.name}
                      onChange={() => setCategory(category.name)}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
            
            {/* Price Range Filter */}
            <FilterSection title="Price Range">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Price (MWK)
                    </label>
                    <input
                      type="number"
                      value={tempPriceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      onBlur={applyPriceRange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Price (MWK)
                    </label>
                    <input
                      type="number"
                      value={tempPriceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      onBlur={applyPriceRange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="1000000"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </div>
              </div>
            </FilterSection>
            
            {/* Rating Filter */}
            <FilterSection title="Customer Rating">
              <div className="space-y-2">
                {ratingOptions.map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === rating}
                      onChange={() => setRating(selectedRating === rating ? 0 : rating)}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i < rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {rating}+ stars
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </FilterSection>
            
            {/* Color Filter */}
            <FilterSection title="Colors">
              <div className="grid grid-cols-3 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={cn(
                      'flex items-center justify-center rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                      selectedColors.includes(color)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                    )}
                  >
                    {selectedColors.includes(color) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {color}
                  </button>
                ))}
              </div>
            </FilterSection>
            
            {/* Size Filter */}
            <FilterSection title="Sizes">
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'flex items-center justify-center rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                      selectedSizes.includes(size)
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                    )}
                  >
                    {selectedSizes.includes(size) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>
            
            {/* Availability & Special Offers */}
            <FilterSection title="Availability & Offers">
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="mr-3 h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <Package className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="mr-3 h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <Tag className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">On Sale</span>
                </label>
              </div>
            </FilterSection>
          </div>
        </div>
      </div>
    </>
  )
}
