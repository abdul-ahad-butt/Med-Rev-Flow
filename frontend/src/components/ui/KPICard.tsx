import { formatCurrency, formatPercent } from '../../utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  format?: 'currency' | 'number' | 'percent' | 'raw'
  trend?: number // percentage change
  trendLabel?: string
  icon?: React.ReactNode
  colorClass?: string
  onClick?: () => void
  subtitle?: string
}

export function KPICard({ title, value, format = 'number', trend, trendLabel, icon, colorClass, onClick, subtitle }: KPICardProps) {
  const displayValue = () => {
    if (typeof value === 'string') return value
    switch (format) {
      case 'currency': return formatCurrency(value)
      case 'percent': return formatPercent(value)
      case 'number': return new Intl.NumberFormat('en-US').format(value)
      default: return String(value)
    }
  }

  return (
    <div
      className={`kpi-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        {icon && (
          <div className={`p-1.5 rounded-md ${colorClass || 'bg-slate-100'}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-slate-900 mb-1">
        {displayValue()}
      </div>

      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% {trendLabel || 'vs last month'}
        </div>
      )}
    </div>
  )
}
