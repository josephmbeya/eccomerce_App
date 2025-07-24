'use client'

import { Loader2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  className?: string
  text?: string
  color?: 'primary' | 'secondary' | 'white' | 'gray'
}

export default function Loader({ 
  size = 'md', 
  variant = 'spinner',
  className, 
  text,
  color = 'primary'
}: LoaderProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const renderLoader = () => {
    const baseClasses = cn(sizeClasses[size], colorClasses[color])
    
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn('animate-spin', baseClasses)} />
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full animate-pulse',
                  size === 'xs' ? 'h-1 w-1' :
                  size === 'sm' ? 'h-1.5 w-1.5' :
                  size === 'md' ? 'h-2 w-2' :
                  size === 'lg' ? 'h-3 w-3' : 'h-4 w-4',
                  colorClasses[color].replace('text-', 'bg-')
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color].replace('text-', 'bg-')
          )} />
        )
      
      case 'bars':
        return (
          <div className="flex items-end space-x-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'animate-pulse',
                  size === 'xs' ? 'w-0.5' :
                  size === 'sm' ? 'w-0.5' :
                  size === 'md' ? 'w-1' :
                  size === 'lg' ? 'w-1.5' : 'w-2',
                  colorClasses[color].replace('text-', 'bg-')
                )}
                style={{
                  height: size === 'xs' ? '8px' :
                         size === 'sm' ? '12px' :
                         size === 'md' ? '16px' :
                         size === 'lg' ? '20px' : '24px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        )
      
      default:
        return <Loader2 className={cn('animate-spin', baseClasses)} />
    }
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {renderLoader()}
      {text && (
        <span className={cn(
          'ml-3 text-gray-600 dark:text-gray-400',
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  )
}

// Specialized loader components for common use cases
export function ButtonLoader({ size = 'sm', color = 'white' }: Pick<LoaderProps, 'size' | 'color'>) {
  return <Loader size={size} color={color} className="mr-2" />
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="xl" text={text} />
      </div>
    </div>
  )
}

export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader size="lg" variant="dots" />
    </div>
  )
}
