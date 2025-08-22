interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "dots" | "pulse" | "bars"
}

export function LoadingSpinner({ size = "md", className = "", variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  if (variant === "dots") {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`bg-purple-600 rounded-full animate-pulse ${
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={`bg-purple-200 rounded-full animate-pulse ${sizeClasses[size]} ${className}`} />
    )
  }

  if (variant === "bars") {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`bg-purple-600 animate-pulse ${
              size === "sm" ? "w-0.5 h-3" : size === "md" ? "w-1 h-6" : "w-1.5 h-8"
            }`}
            style={{ 
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingProps {
  message?: string
  className?: string
  variant?: "default" | "dots" | "pulse" | "bars"
  showProgress?: boolean
  progress?: number
  detailed?: boolean
  steps?: string[]
  currentStep?: number
}

export function Loading({ 
  message = "Loading...", 
  className = "", 
  variant = "default",
  showProgress = false,
  progress = 0,
  detailed = false,
  steps = [],
  currentStep = 0
}: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" variant={variant} />
      
      {showProgress && (
        <div className="w-full max-w-xs mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
      
      <p className="mt-4 text-gray-600 text-sm text-center">{message}</p>
      
      {detailed && steps.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-2 rounded ${
                  index < currentStep 
                    ? 'text-green-600 bg-green-50'
                    : index === currentStep
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-400 bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  index < currentStep 
                    ? 'bg-green-500'
                    : index === currentStep
                    ? 'bg-purple-500 animate-pulse'
                    : 'bg-gray-300'
                }`} />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: "text" | "rectangular" | "circular"
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular", 
  width, 
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "skeleton bg-gray-200 animate-pulse"
  
  if (variant === "text") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={`${baseClasses} h-4 rounded`}
            style={{ 
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    )
  }
  
  if (variant === "circular") {
    return (
      <div 
        className={`${baseClasses} rounded-full ${className}`}
        style={{ width, height }}
      />
    )
  }
  
  return (
    <div 
      className={`${baseClasses} rounded ${className}`}
      style={{ width, height }}
    />
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className = "" }: LoadingCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} className="mb-4" />
      <Skeleton variant="text" lines={3} />
    </div>
  )
}