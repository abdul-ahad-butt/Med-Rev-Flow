// Loading skeleton components

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <SkeletonLine className="w-24" />
      <SkeletonLine className="w-32 h-8" />
      <SkeletonLine className="w-20" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="section-card">
      <div className="px-4 py-3 border-b border-slate-100">
        <SkeletonLine className="w-32" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} className={c === 0 ? 'w-24' : c === cols - 1 ? 'w-16' : 'flex-1'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonKPIs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Empty state
interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-3 text-slate-300">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// Error state
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
        <span className="text-red-600 text-lg">!</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-500 mb-4">{message || 'Failed to load data. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-blue-600 hover:underline font-medium">
          Try again
        </button>
      )}
    </div>
  )
}
