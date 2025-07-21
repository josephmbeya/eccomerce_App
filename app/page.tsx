'use client'

import { useState } from 'react'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Star,
  ArrowRight,
  Truck,
  Shield,
  Zap,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import ProductModal from '@/components/ProductModal'
import { products } from '@/lib/products'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setSelectedProduct(null)
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-serif bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                TISHOPE
              </h1>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-300 bg-white/50 py-2 pl-10 pr-4 text-sm backdrop-blur-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                <Heart className="h-5 w-5" />
              </button>
              <button className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200/50 py-4 md:hidden dark:border-gray-700/50">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-lg border border-gray-300 bg-white/50 py-2 pl-10 pr-4 text-sm backdrop-blur-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="flex items-center justify-around">
                  <button className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-300">
                    <Heart className="h-5 w-5" />
                    <span className="text-xs">Wishlist</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-300">
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary-500 text-xs text-white flex items-center justify-center">
                        3
                      </span>
                    </div>
                    <span className="text-xs">Cart</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1 text-gray-600 dark:text-gray-300">
                    <User className="h-5 w-5" />
                    <span className="text-xs">Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Your Ultimate{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-serif">
                Shopping
              </span>{' '}
              Destination
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Discover premium products with exceptional quality, competitive prices in Malawian Kwacha, 
              and an unmatched shopping experience designed just for you.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="btn-primary">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button className="btn-secondary">
                Browse Categories
              </button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary-400 to-secondary-600 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Free Shipping</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Free delivery on orders over MWK 50,000
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
                <Shield className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Payment</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                100% secure payment with 2-year warranty
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/30">
                <Zap className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Quick delivery within 2-3 business days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Discover our handpicked selection of premium products
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0
              
              return (
                <div
                  key={product.id}
                  className="group card cursor-pointer"
                  onClick={() => openProductModal(product)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {product.badge && (
                      <div className="absolute left-3 top-3 z-10">
                        <span className={cn(
                          'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                          product.badge === 'Best Seller' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                          product.badge === 'New' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                          product.badge === 'Sale' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                          product.badge === 'Limited Edition' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        )}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                    <button className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400">
                      <Heart className="h-4 w-4" />
                    </button>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        ({product.reviewCount})
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                              {formatPrice(product.originalPrice)}
                            </span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              -{discount}%
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Add to cart logic
                        }}
                        className="rounded-lg bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <button className="btn-secondary">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stay Updated
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Subscribe to our newsletter for the latest deals and exclusive offers
          </p>
          <div className="mt-8 flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-l-lg border-0 py-3 px-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="rounded-r-lg bg-white px-6 py-3 text-primary-600 font-semibold hover:bg-gray-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold font-serif text-white">TISHOPE</h3>
              <p className="mt-4 text-gray-400 max-w-md">
                Your ultimate shopping destination with premium products, competitive prices in MWK, 
                and exceptional customer service. Experience the future of e-commerce today.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white">Contact Info</h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  +265 123 456 789
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  hello@tishope.com
                </li>
                <li className="flex items-start text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                  <span>123 Commerce Street<br />Lilongwe, Malawi</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-800 pt-8">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <p className="text-gray-400 text-sm">
                © 2025 TISHOPE. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Made with ❤️ in Malawi
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
      />
    </div>
  )
}
