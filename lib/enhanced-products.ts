import { prisma } from '@/lib/prisma'

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'created_desc'
  limit?: number
  offset?: number
}

export interface ProductWithDetails {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  sku: string
  inStock: boolean
  inventory: number
  stockQuantity: number
  tags: string[]
  featured: boolean
  rating: number | null
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export class ProductManager {
  // Enhanced product search with filters
  async searchProducts(filters: ProductFilters = {}): Promise<{
    products: ProductWithDetails[]
    totalCount: number
    hasMore: boolean
  }> {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'created_desc',
      limit = 12,
      offset = 0
    } = filters

    // Build where clause
    const where: any = {}

    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (inStock !== undefined) {
      where.inStock = inStock
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    // Build order by clause
    const orderBy: any = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy.price = 'asc'
        break
      case 'price_desc':
        orderBy.price = 'desc'
        break
      case 'name_asc':
        orderBy.name = 'asc'
        break
      case 'name_desc':
        orderBy.name = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where })
    ])

    return {
      products: products as ProductWithDetails[],
      totalCount,
      hasMore: offset + limit < totalCount
    }
  }

  // Get product categories with counts
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    return categories.map((cat: any) => ({
      category: cat.category,
      count: cat._count.category
    }))
  }

  // Get price range for filters
  async getPriceRange(): Promise<{ min: number; max: number }> {
    const result = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true }
    })

    return {
      min: result._min.price || 0,
      max: result._max.price || 0
    }
  }

  // Update inventory
  async updateInventory(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) return false

      const newQuantity = product.stockQuantity + quantity
      const inStock = newQuantity > 0

      await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newQuantity,
          inStock
        }
      })

      return true
    } catch (error) {
      console.error('Error updating inventory:', error)
      return false
    }
  }

  // Get low stock products (for admin alerts)
  async getLowStockProducts(threshold: number = 10): Promise<ProductWithDetails[]> {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: threshold
        },
        inStock: true
      },
      orderBy: {
        stockQuantity: 'asc'
      }
    })

    return products as ProductWithDetails[]
  }

  // Get popular products based on order frequency
  async getPopularProducts(limit: number = 10): Promise<ProductWithDetails[]> {
    // This would require analyzing order data
    // For now, return recent products
    const products = await prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return products as ProductWithDetails[]
  }

  // Add product review (requires review table)
  async addReview(productId: string, userId: string, rating: number, comment: string): Promise<boolean> {
    try {
      // This would require a Review model in your Prisma schema
      // For now, just update the product rating
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) return false

      // Calculate new average rating
      // This is simplified - in production, you'd store individual reviews
      const currentRating = product.rating || 0
      const currentCount = product.reviewCount || 0
      const newCount = currentCount + 1
      const newRating = ((currentRating * currentCount) + rating) / newCount

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: newRating,
          reviewCount: newCount
        }
      })

      return true
    } catch (error) {
      console.error('Error adding review:', error)
      return false
    }
  }

  // Bulk operations for admin
  async bulkUpdatePrices(productIds: string[], priceMultiplier: number): Promise<number> {
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: {
        price: {
          multiply: priceMultiplier
        }
      }
    })

    return result.count
  }

  async bulkUpdateCategory(productIds: string[], category: string): Promise<number> {
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: { category }
    })

    return result.count
  }
}

// Export singleton instance
export const productManager = new ProductManager()
