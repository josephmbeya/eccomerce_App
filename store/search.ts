import { create } from 'zustand'
import { Product } from '@/lib/types'

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popularity' | 'discount'
type ViewMode = 'grid' | 'list'

interface FilterState {
  searchQuery: string
  selectedCategory: string
  priceRange: { min: number; max: number }
  selectedRating: number
  selectedBrands: string[]
  selectedColors: string[]
  selectedSizes: string[]
  inStockOnly: boolean
  onSaleOnly: boolean
  sortBy: SortOption
  viewMode: ViewMode
}

interface SearchState extends FilterState {
  filteredProducts: Product[]
  isFiltering: boolean
  searchHistory: string[]
  recentSearches: string[]
  popularSearches: string[]
  searchSuggestions: string[]
  totalResults: number
  currentPage: number
  resultsPerPage: number
  
  // Search actions
  setSearchQuery: (query: string) => void
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
  
  // Filter actions
  setCategory: (category: string) => void
  setPriceRange: (range: { min: number; max: number }) => void
  setRating: (rating: number) => void
  toggleBrand: (brand: string) => void
  toggleColor: (color: string) => void
  toggleSize: (size: string) => void
  setInStockOnly: (inStock: boolean) => void
  setOnSaleOnly: (onSale: boolean) => void
  setSortBy: (sort: SortOption) => void
  setViewMode: (mode: ViewMode) => void
  
  // Core functions
  filterProducts: (products: Product[]) => void
  generateSuggestions: (products: Product[]) => void
  clearFilters: () => void
  resetSearch: () => void
  
  // Pagination
  setCurrentPage: (page: number) => void
  setResultsPerPage: (count: number) => void
  getPaginatedResults: () => Product[]
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  // Initial state
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: { min: 0, max: 1000000 },
  selectedRating: 0,
  selectedBrands: [],
  selectedColors: [],
  selectedSizes: [],
  inStockOnly: false,
  onSaleOnly: false,
  sortBy: 'newest',
  viewMode: 'grid',
  filteredProducts: [],
  isFiltering: false,
  searchHistory: [],
  recentSearches: [],
  popularSearches: ['headphones', 't-shirt', 'coffee', 'bag', 'watch'],
  searchSuggestions: [],
  totalResults: 0,
  currentPage: 1,
  resultsPerPage: 12,
  
  // Search actions
  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 })
    if (query.trim()) {
      get().addToSearchHistory(query)
    }
  },
  
  addToSearchHistory: (query) => {
    const { searchHistory, recentSearches } = get()
    const trimmedQuery = query.trim().toLowerCase()
    
    if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
      const newHistory = [trimmedQuery, ...searchHistory.slice(0, 9)] // Keep last 10
      const newRecent = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery).slice(0, 4)] // Keep last 5
      
      set({ 
        searchHistory: newHistory,
        recentSearches: newRecent
      })
    }
  },
  
  clearSearchHistory: () => {
    set({ searchHistory: [], recentSearches: [] })
  },
  
  // Filter actions
  setCategory: (category) => {
    set({ selectedCategory: category, currentPage: 1 })
  },
  
  setPriceRange: (range) => {
    set({ priceRange: range, currentPage: 1 })
  },
  
  setRating: (rating) => {
    set({ selectedRating: rating, currentPage: 1 })
  },
  
  toggleBrand: (brand) => {
    const { selectedBrands } = get()
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand]
    set({ selectedBrands: newBrands, currentPage: 1 })
  },
  
  toggleColor: (color) => {
    const { selectedColors } = get()
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color]
    set({ selectedColors: newColors, currentPage: 1 })
  },
  
  toggleSize: (size) => {
    const { selectedSizes } = get()
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    set({ selectedSizes: newSizes, currentPage: 1 })
  },
  
  setInStockOnly: (inStock) => {
    set({ inStockOnly: inStock, currentPage: 1 })
  },
  
  setOnSaleOnly: (onSale) => {
    set({ onSaleOnly: onSale, currentPage: 1 })
  },
  
  setSortBy: (sort) => {
    set({ sortBy: sort, currentPage: 1 })
  },
  
  setViewMode: (mode) => {
    set({ viewMode: mode })
  },
  
  // Core functions
  filterProducts: (products) => {
    set({ isFiltering: true })
    
    const {
      searchQuery,
      selectedCategory,
      priceRange,
      selectedRating,
      selectedBrands,
      selectedColors,
      selectedSizes,
      inStockOnly,
      onSaleOnly,
      sortBy
    } = get()
    
    let filtered = [...products]
    
    // Filter by search query (enhanced with fuzzy matching)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const searchTerms = query.split(' ').filter(term => term.length > 0)
      
      filtered = filtered.filter(product => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          ...(product.features || []),
          ...(product.colors || []),
          ...(product.sizes || [])
        ].join(' ').toLowerCase()
        
        return searchTerms.some(term => searchableText.includes(term))
      })
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    )
    
    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter(product => product.rating >= selectedRating)
    }
    
    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && selectedColors.some(color => 
          product.colors!.some(pc => pc.toLowerCase() === color.toLowerCase())
        )
      )
    }
    
    // Filter by sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && selectedSizes.some(size => 
          product.sizes!.some(ps => ps.toLowerCase() === size.toLowerCase())
        )
      )
    }
    
    // Filter by stock status
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock && (product.stockCount || 0) > 0)
    }
    
    // Filter by sale status
    if (onSaleOnly) {
      filtered = filtered.filter(product => product.originalPrice && product.originalPrice > product.price)
    }
    
    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'popularity':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'discount':
        filtered.sort((a, b) => {
          const aDiscount = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0
          const bDiscount = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0
          return bDiscount - aDiscount
        })
        break
      case 'newest':
      default:
        // Keep original order for newest
        break
    }
    
    set({ 
      filteredProducts: filtered, 
      totalResults: filtered.length,
      isFiltering: false 
    })
  },
  
  generateSuggestions: (products) => {
    const { searchQuery } = get()
    
    if (!searchQuery.trim()) {
      set({ searchSuggestions: [] })
      return
    }
    
    const query = searchQuery.toLowerCase()
    const suggestions = new Set<string>()
    
    products.forEach(product => {
      // Add product names that match
      if (product.name.toLowerCase().includes(query)) {
        suggestions.add(product.name)
      }
      
      // Add categories that match
      if (product.category?.toLowerCase().includes(query)) {
        suggestions.add(product.category)
      }
      
      // Add features that match
      product.features?.forEach(feature => {
        if (feature.toLowerCase().includes(query)) {
          suggestions.add(feature)
        }
      })
    })
    
    set({ searchSuggestions: Array.from(suggestions).slice(0, 8) })
  },
  
  clearFilters: () => {
    set({
      selectedCategory: 'all',
      priceRange: { min: 0, max: 1000000 },
      selectedRating: 0,
      selectedBrands: [],
      selectedColors: [],
      selectedSizes: [],
      inStockOnly: false,
      onSaleOnly: false,
      currentPage: 1
    })
  },
  
  resetSearch: () => {
    set({
      searchQuery: '',
      selectedCategory: 'all',
      priceRange: { min: 0, max: 1000000 },
      selectedRating: 0,
      selectedBrands: [],
      selectedColors: [],
      selectedSizes: [],
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'newest',
      filteredProducts: [],
      totalResults: 0,
      currentPage: 1,
      searchSuggestions: []
    })
  },
  
  // Pagination
  setCurrentPage: (page) => {
    set({ currentPage: page })
  },
  
  setResultsPerPage: (count) => {
    set({ resultsPerPage: count, currentPage: 1 })
  },
  
  getPaginatedResults: () => {
    const { filteredProducts, currentPage, resultsPerPage } = get()
    const startIndex = (currentPage - 1) * resultsPerPage
    const endIndex = startIndex + resultsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }
}))
