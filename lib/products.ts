import { Product } from './types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    description: 'Soft, breathable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable regular fit.',
    price: 25000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop'
    ],
    category: 'Clothing',
    rating: 4.5,
    reviewCount: 124,
    badge: 'Best Seller',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy', 'Gray'],
    inStock: true,
    stockCount: 45,
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Tag-free comfort', 'Machine washable'],
    specifications: {
      'Material': '100% Organic Cotton',
      'Fit': 'Regular',
      'Care': 'Machine wash cold',
      'Origin': 'Made in Malawi'
    }
  },
  {
    id: '2',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 180000,
    originalPrice: 220000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
    ],
    category: 'Electronics',
    rating: 4.7,
    reviewCount: 89,
    badge: 'New',
    colors: ['Black', 'White', 'Blue'],
    inStock: true,
    stockCount: 23,
    features: ['Active Noise Cancellation', '30-hour battery', 'Quick charge', 'Comfortable fit'],
    specifications: {
      'Driver': '40mm dynamic',
      'Frequency Response': '20Hz-20kHz',
      'Battery Life': '30 hours',
      'Charging': 'USB-C fast charging'
    }
  },
  {
    id: '3',
    name: 'Designer Leather Handbag',
    description: 'Elegant leather handbag crafted from genuine leather with multiple compartments and adjustable strap.',
    price: 450000,
    originalPrice: 550000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=500&fit=crop'
    ],
    category: 'Accessories',
    rating: 4.8,
    reviewCount: 156,
    badge: 'Limited Edition',
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    stockCount: 12,
    features: ['Genuine leather', 'Multiple compartments', 'Adjustable strap', 'Gold-tone hardware'],
    specifications: {
      'Material': 'Genuine Italian Leather',
      'Dimensions': '32cm x 25cm x 12cm',
      'Strap': 'Adjustable 50-120cm',
      'Closure': 'Magnetic snap'
    }
  },
  {
    id: '4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&h=500&fit=crop'
    ],
    category: 'Electronics',
    rating: 4.6,
    reviewCount: 203,
    badge: 'Sale',
    colors: ['Black', 'Silver', 'Rose Gold'],
    inStock: true,
    stockCount: 31,
    features: ['Heart rate monitor', 'GPS tracking', '7-day battery', 'Water resistant'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days typical use',
      'Water Resistance': '5ATM',
      'Connectivity': 'Bluetooth 5.0'
    }
  },
  {
    id: '5',
    name: 'Organic Coffee Beans',
    description: 'Premium single-origin coffee beans from the highlands of Malawi, roasted to perfection.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&h=500&fit=crop'
    ],
    category: 'Food & Beverage',
    rating: 4.9,
    reviewCount: 78,
    inStock: true,
    stockCount: 67,
    features: ['Single-origin', 'Organic certified', 'Freshly roasted', 'Fair trade'],
    specifications: {
      'Origin': 'Malawi Highlands',
      'Roast': 'Medium',
      'Weight': '500g',
      'Certification': 'Organic & Fair Trade'
    }
  },
  {
    id: '6',
    name: 'Artisan Ceramic Vase',
    description: 'Beautiful handcrafted ceramic vase with unique glaze patterns, perfect for home decoration.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1549778399-f94fd24d4697?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&h=500&fit=crop'
    ],
    category: 'Home & Garden',
    rating: 4.4,
    reviewCount: 42,
    badge: 'New',
    colors: ['Blue', 'Green', 'White'],
    inStock: true,
    stockCount: 18,
    features: ['Handcrafted', 'Unique patterns', 'Food safe glaze', 'Easy to clean'],
    specifications: {
      'Material': 'High-quality ceramic',
      'Height': '25cm',
      'Diameter': '15cm',
      'Care': 'Hand wash recommended'
    }
  }
]

export const categories = [
  { id: '1', name: 'Clothing', slug: 'clothing' },
  { id: '2', name: 'Electronics', slug: 'electronics' },
  { id: '3', name: 'Accessories', slug: 'accessories' },
  { id: '4', name: 'Food & Beverage', slug: 'food-beverage' },
  { id: '5', name: 'Home & Garden', slug: 'home-garden' }
]
