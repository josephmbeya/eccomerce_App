import toast, { Toast, resolveValue } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import * as React from 'react'

// Custom toast types
export const customToast = {
  success: (message: string) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid #10B981',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#FFFFFF',
      },
    })
  },
  
  error: (message: string) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid #EF4444',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
    })
  },
  
  warning: (message: string) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid #F59E0B',
        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
      },
    })
  },
  
  info: (message: string) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid #3B82F6',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
      },
    })
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid var(--toast-border)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    })
  },
  
  promise: <T,>(promise: Promise<T>, msgs: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  }) => {
    return toast.promise(promise, msgs, {
      style: {
        borderRadius: '12px',
        background: 'var(--toast-bg)',
        color: 'var(--toast-color)',
        border: '1px solid var(--toast-border)',
      },
      success: {
        duration: 4000,
        iconTheme: {
          primary: '#10B981',
          secondary: '#FFFFFF',
        },
      },
      error: {
        duration: 5000,
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FFFFFF',
        },
      },
    })
  }
}

// Utility functions for common scenarios
export const showApiError = (error: any, defaultMessage = 'Something went wrong') => {
  const message = error?.response?.data?.message || error?.message || defaultMessage
  return customToast.error(message)
}

export const showValidationErrors = (errors: Record<string, string[]>) => {
  const firstError = Object.values(errors)[0]?.[0]
  if (firstError) {
    return customToast.error(firstError)
  }
}

export const confirmAction = async (message: string, onConfirm: () => Promise<void>) => {
  const confirmed = window.confirm(message)
  if (confirmed) {
    const loadingToast = customToast.loading('Processing...')
    try {
      await onConfirm()
      toast.dismiss(loadingToast)
      return true
    } catch (error) {
      toast.dismiss(loadingToast)
      showApiError(error)
      return false
    }
  }
  return false
}
