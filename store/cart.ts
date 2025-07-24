import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/lib/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product, quantity = 1, size, color) => {
        const existingItemIndex = get().items.findIndex(
          (item) => 
            item.product.id === product.id && 
            item.size === size && 
            item.color === color
        )
        
        if (existingItemIndex !== -1) {
          // Update existing item quantity
          set((state) => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }))
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${size || 'default'}-${color || 'default'}`,
            product,
            quantity,
            size,
            color,
          }
          set((state) => ({ items: [...state.items, newItem] }))
        }
      },
      
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
        
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: quantity === 0 
            ? state.items.filter((item) => item.id !== itemId)
            : state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
        })),
        
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'tishope-cart-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          try {
            const item = localStorage.getItem(name)
            return item ? JSON.parse(item) : null
          } catch (error) {
            console.warn('Failed to parse cart storage:', error)
            localStorage.removeItem(name)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.warn('Failed to save cart storage:', error)
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      },
    }
  )
)

