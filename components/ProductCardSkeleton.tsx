export default function ProductCardSkeleton() {
  return (
    <div className="group card animate-pulse">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        {/* Badge skeleton */}
        <div className="absolute left-3 top-3 z-10 h-6 w-16 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        {/* Heart button skeleton */}
        <div className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
      
      <div className="mt-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
          <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  )
}
