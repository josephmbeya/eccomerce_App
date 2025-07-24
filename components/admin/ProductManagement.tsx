'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Package,
  DollarSign,
  Filter,
  X
} from 'lucide-react'
import { Product } from '@/lib/types'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const categories = [
    'all',
    'Clothing',
    'Electronics',
    'Accessories',
    'Food & Beverage',
    'Home & Garden'
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast.error('Failed to fetch products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete product')
      
      setProducts(products.filter(p => p.id !== productId))
      toast.success('Product deleted successfully')
      setShowDeleteModal(false)
      setSelectedProduct(null)
    } catch (error) {
      toast.error('Failed to delete product')
      console.error(error)
    }
  }

  const ProductModal = ({ isOpen, onClose, product, isEdit = false }: {
    isOpen: boolean
    onClose: () => void
    product?: Product | null
    isEdit?: boolean
  }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      image: '',
      category: 'Clothing',
      rating: 0,
      reviewCount: 0,
      inStock: true,
      stockCount: 0,
      sizes: [],
      colors: [],
      features: [],
    })

    useEffect(() => {
      if (product && isEdit) {
        setFormData(product)
      }
    }, [product, isEdit])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const url = isEdit ? `/api/admin/products/${product?.id}` : '/api/admin/products'
        const method = isEdit ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            id: isEdit ? product?.id : Date.now().toString(),
            images: formData.image ? [formData.image] : [],
            badge: undefined, // Will be set based on business logic
          }),
        })

        if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} product`)
        
        const savedProduct = await response.json()
        
        if (isEdit) {
          setProducts(products.map(p => p.id === product?.id ? savedProduct : p))
          toast.success('Product updated successfully')
        } else {
          setProducts([...products, savedProduct])
          toast.success('Product created successfully')
        }
        
        onClose()
      } catch (error) {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} product`)
        console.error(error)
      }
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (MWK) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price (MWK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => setFormData({...formData, stockCount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  In Stock
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 
                           dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {isEdit ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} products found
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  Stock: {product.stockCount}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    MWK {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      MWK {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {product.category}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowEditModal(true)
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900 
                           text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowDeleteModal(true)
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900 
                           text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <ProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        isEdit={true}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Product
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete &ldquo;{selectedProduct.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedProduct(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 
                         dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(selectedProduct.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
