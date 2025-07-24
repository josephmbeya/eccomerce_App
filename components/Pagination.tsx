'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useSearchStore } from '@/store/search'
import { cn } from '@/lib/utils'

interface PaginationProps {
  className?: string
}

export default function Pagination({ className }: PaginationProps) {
  const {
    currentPage,
    resultsPerPage,
    totalResults,
    setCurrentPage,
    setResultsPerPage
  } = useSearchStore()
  
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  const startResult = (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalResults)
  
  if (totalResults === 0) return null
  
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    rangeWithDots.push(...range)
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }
    
    // Remove duplicates and fix edge cases
    const result = rangeWithDots.filter((item, index, arr) => {
      if (item === 1 && arr[index + 1] === 1) return false
      if (item === totalPages && arr[index - 1] === totalPages) return false
      return true
    })
    
    return result
  }
  
  const visiblePages = getVisiblePages()
  
  return (
    <div className={cn('flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0', className)}>
      {/* Results Info */}
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{startResult}</span> to <span className="font-medium">{endResult}</span> of{' '}
          <span className="font-medium">{totalResults}</span> results
        </p>
        
        {/* Results Per Page */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Show:
          </label>
          <select
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            per page
          </span>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex items-center space-x-1">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentPage === 1
                ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={cn(
                    'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  )}
                >
                  {page}
                </button>
              )
            })}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentPage === totalPages
                ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
