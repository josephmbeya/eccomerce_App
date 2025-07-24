'use client'

import { useState, useCallback, useRef } from 'react'

type LoadingState = {
  [key: string]: boolean
}

interface UseLoadingStatesReturn {
  loadingStates: LoadingState
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  setLoading: (key: string, loading: boolean) => void
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>
  clearAll: () => void
}

export function useLoadingStates(): UseLoadingStatesReturn {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    // Clear any existing timeout for this key
    if (timeoutsRef.current[key]) {
      clearTimeout(timeoutsRef.current[key])
      delete timeoutsRef.current[key]
    }

    if (loading) {
      // Set loading immediately
      setLoadingStates(prev => ({ ...prev, [key]: true }))
    } else {
      // Add a small delay before removing loading state to prevent flickering
      timeoutsRef.current[key] = setTimeout(() => {
        setLoadingStates(prev => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
        delete timeoutsRef.current[key]
      }, 150)
    }
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(key, true)
      const result = await asyncFn()
      return result
    } finally {
      setLoading(key, false)
    }
  }, [setLoading])

  const clearAll = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(clearTimeout)
    timeoutsRef.current = {}
    setLoadingStates({})
  }, [])

  return {
    loadingStates,
    isLoading,
    isAnyLoading,
    setLoading,
    withLoading,
    clearAll
  }
}

// Specialized hook for form submissions
export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submitForm = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: any) => void
      resetErrorOnSubmit?: boolean
    }
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      
      if (options?.resetErrorOnSubmit !== false) {
        setSubmitError(null)
      }
      
      const result = await asyncFn()
      options?.onSuccess?.(result)
      return true
    } catch (error: any) {
      const errorMessage = error?.message || 'Submission failed'
      setSubmitError(errorMessage)
      options?.onError?.(error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setSubmitError(null)
  }, [])

  return {
    isSubmitting,
    submitError,
    submitForm,
    clearError
  }
}

// Hook for pagination loading
export function usePaginationLoading() {
  const [loadingPage, setLoadingPage] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadPage = useCallback(async <T>(
    pageNumber: number,
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoadingPage(pageNumber)
      const result = await asyncFn()
      return result
    } catch (error) {
      console.error('Error loading page:', error)
      return null
    } finally {
      setLoadingPage(null)
    }
  }, [])

  const loadMoreItems = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoadingMore(true)
      const result = await asyncFn()
      return result
    } catch (error) {
      console.error('Error loading more items:', error)
      return null
    } finally {
      setLoadingMore(false)
    }
  }, [])

  return {
    loadingPage,
    loadingMore,
    isLoadingPage: (page: number) => loadingPage === page,
    loadPage,
    loadMoreItems
  }
}
