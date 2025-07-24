'use client'

import { useState } from 'react'
import { 
  ArrowUpDown, 
  Grid, 
  List, 
  ChevronDown,
  Filter,
  X
} from 'lucide-react'
import { useSearchStore } from '@/store/search'
import { cn } from '@/lib/utils'

interface SortControlsProps {
  onFilterToggle: () => void
  showFilters: boolean
  className?: string
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'discount', label: 'Biggest Discount' },
] as const

export default function SortControls({ onFilterToggle, showFilters, className }: SortControlsProps) {
  const {
    sortBy,
    viewMode,
    totalResults,
    searchQuery,
    selectedCategory,
    selectedColors,
    selectedSizes,
    inStockOnly,
    onSaleOnly,
    setSortBy,
    setViewMode,
    clearFilters
  } = useSearchStore()
  
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  
  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort by'
  
  const hasActiveFilters = 
    selectedCategory !== 'all' ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    inStockOnly ||
    onSaleOnly
  
  return (
    <div className={cn('flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0', className)}>
      {/* Results Info and Active Filters */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalResults > 0 ? (
              <>
                Showing <span className="font-medium">{totalResults}</span> result{totalResults !== 1 ? 's' : ''}
                {searchQuery && (
                  <> for &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo;
                  </>
                )}
              </>
            ) : (
              'No results found'
            )}
          </p>
        </div>
        
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {selectedCategory}
                <button
                  onClick={() => useSearchStore.getState().setCategory('all')}
                  className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-primary-200 dark:hover:bg-primary-800"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}
            
            {selectedColors.map(color => (
              <span key={color} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {color}
                <button
                  onClick={() => useSearchStore.getState().toggleColor(color)}
                  className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}
            
            {selectedSizes.map(size => (
              <span key={size} className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                {size}
                <button
                  onClick={() => useSearchStore.getState().toggleSize(size)}
                  className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}
            
            {inStockOnly && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                In Stock
                <button
                  onClick={() => useSearchStore.getState().setInStockOnly(false)}
                  className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}
            
            {onSaleOnly && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                On Sale
                <button
                  onClick={() => useSearchStore.getState().setOnSaleOnly(false)}
                  className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                >
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}
            
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-3">
        {/* Filter Toggle (Mobile) */}
        <button
          onClick={onFilterToggle}
          className={cn(
            'inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors lg:hidden',
            showFilters
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
              {[selectedCategory !== 'all' ? 1 : 0, selectedColors.length, selectedSizes.length, inStockOnly ? 1 : 0, onSaleOnly ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {currentSortLabel}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
          
          {showSortDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                      sortBy === option.value
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-l-lg px-3 py-2 text-sm font-medium transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-r-lg px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600',
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
