'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useSearchStore } from '@/store/search'
import { products } from '@/lib/products'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
  autoFocus?: boolean
}

export default function SearchBar({ 
  className, 
  placeholder = "Search products, categories, features...", 
  showSuggestions = true,
  autoFocus = false 
}: SearchBarProps) {
  const {
    searchQuery,
    searchSuggestions,
    recentSearches,
    popularSearches,
    setSearchQuery,
    generateSuggestions,
    filterProducts
  } = useSearchStore()
  
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    
    // Only add listener when dropdown is shown to prevent interference
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (showSuggestions) {
      generateSuggestions(products)
    }
    
    // Trigger filtering with debounce
    setTimeout(() => {
      filterProducts(products)
    }, 300)
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    filterProducts(products)
    setShowDropdown(false)
    inputRef.current?.blur()
  }
  
  const handleClearSearch = () => {
    setSearchQuery('')
    filterProducts(products)
    inputRef.current?.focus()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      filterProducts(products)
      setShowDropdown(false)
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }
  
  const shouldShowDropdown = showSuggestions && isFocused && showDropdown && (
    searchSuggestions.length > 0 || 
    recentSearches.length > 0 || 
    (searchQuery.length === 0 && popularSearches.length > 0)
  )
  
  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true)
            setShowDropdown(true)
          }}
          onBlur={(e) => {
            // Don't close dropdown if clicking on suggestion items
            if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
              setIsFocused(false)
              // Delay hiding dropdown to allow for clicks
              setTimeout(() => setShowDropdown(false), 150)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white/80 py-3 pl-10 pr-12 text-sm backdrop-blur-sm placeholder:text-gray-500 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-400 dark:focus:bg-gray-800"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Search Suggestions Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Search className="mr-2 h-3 w-3" />
                Suggestions
              </div>
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Search className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">{suggestion}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
          
          {/* Recent Searches */}
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="border-t border-gray-200 p-2 dark:border-gray-700">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Clock className="mr-2 h-3 w-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Clock className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">{search}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
          
          {/* Popular Searches */}
          {searchQuery.length === 0 && popularSearches.length > 0 && (
            <div className="border-t border-gray-200 p-2 dark:border-gray-700">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <TrendingUp className="mr-2 h-3 w-3" />
                Popular Searches
              </div>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <TrendingUp className="mr-3 h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">{search}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
