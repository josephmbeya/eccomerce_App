'use client'

import { useState, useCallback } from 'react'
import { customToast, showApiError } from '@/lib/toast'

interface UseErrorHandlerReturn {
  error: Error | null
  isError: boolean
  clearError: () => void
  handleError: (error: any, fallbackMessage?: string) => void
  handleAsync: <T>(asyncFn: () => Promise<T>, loadingMessage?: string) => Promise<T | null>
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: any, fallbackMessage?: string) => {
    console.error('Error caught by error handler:', error)
    
    let errorObj: Error
    if (error instanceof Error) {
      errorObj = error
    } else if (typeof error === 'string') {
      errorObj = new Error(error)
    } else {
      errorObj = new Error(fallbackMessage || 'An unexpected error occurred')
    }
    
    setError(errorObj)
    showApiError(error, fallbackMessage)
  }, [])

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T | null> => {
    try {
      clearError()
      
      let loadingToast: string | undefined
      if (loadingMessage) {
        loadingToast = customToast.loading(loadingMessage)
      }
      
      const result = await asyncFn()
      
      if (loadingToast) {
        customToast.success('Success!')
      }
      
      return result
    } catch (error) {
      handleError(error)
      return null
    }
  }, [clearError, handleError])

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    handleAsync
  }
}

// Specialized hooks for common patterns
export function useAsyncAction() {
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      onSuccess?: (result: T) => void
      onError?: (error: any) => void
    }
  ): Promise<T | null> => {
    try {
      setLoading(true)
      
      let loadingToast: string | undefined
      if (options?.loadingMessage) {
        loadingToast = customToast.loading(options.loadingMessage)
      }
      
      const result = await asyncFn()
      
      if (loadingToast) {
        customToast.success(options?.successMessage || 'Success!')
      }
      
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      handleError(error)
      options?.onError?.(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  return { loading, execute }
}

// API-specific error handler
export function useApiErrorHandler() {
  const handleApiError = useCallback((error: any, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error)
    
    // Handle different types of API errors
    if (error?.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          customToast.error(data?.message || 'Invalid request')
          break
        case 401:
          customToast.error('You need to sign in to continue')
          // Optionally redirect to login
          break
        case 403:
          customToast.error('You don\'t have permission to perform this action')
          break
        case 404:
          customToast.error('The requested resource was not found')
          break
        case 422:
          if (data?.errors) {
            // Handle validation errors
            const firstError = Object.values(data.errors)[0] as string[]
            customToast.error(firstError[0] || 'Validation failed')
          } else {
            customToast.error(data?.message || 'Validation failed')
          }
          break
        case 429:
          customToast.error('Too many requests. Please try again later.')
          break
        case 500:
          customToast.error('Server error. Please try again later.')
          break
        default:
          customToast.error(data?.message || `Request failed with status ${status}`)
      }
    } else if (error?.request) {
      customToast.error('Network error. Please check your connection.')
    } else {
      customToast.error(error?.message || 'An unexpected error occurred')
    }
  }, [])

  return { handleApiError }
}
