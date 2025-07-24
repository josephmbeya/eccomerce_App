import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface AuthState {
  user: User | null
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'register'
  setUser: (user: User | null) => void
  openAuthModal: (mode?: 'login' | 'register') => void
  closeAuthModal: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false,
      authModalMode: 'login',
      
      setUser: (user) => set({ user }),
      
      openAuthModal: (mode = 'login') => set({ 
        isAuthModalOpen: true, 
        authModalMode: mode 
      }),
      
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      
      logout: () => set({ user: null }),
    }),
    {
      name: 'tishope-auth-storage',
      partialize: (state) => ({ user: state.user }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          try {
            const item = localStorage.getItem(name)
            return item ? JSON.parse(item) : null
          } catch (error) {
            console.warn('Failed to parse auth storage:', error)
            localStorage.removeItem(name)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.warn('Failed to save auth storage:', error)
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
