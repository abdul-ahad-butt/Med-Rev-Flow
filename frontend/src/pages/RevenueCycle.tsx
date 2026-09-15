import { useEffect, useState, useCallback } from 'react'
import { DollarSign, TrendingUp, AlertCircle, FileText, RefreshCw } from 'lucide-react'
import { KPICard } from '../components/ui/KPICard'
import { SkeletonKPIs, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency } from '../utils/cn'
import api from '../api/client'

interface ARBucket { agingBucket: string; balance: number; count: number }
interface RCMData {
  kpis: {
    monthlyRevenue: number
    totalClaims:   number
    openDenials:   number
    collectionRate: number
    pendingAR:     number
    activePatients: number
  }
  arBuckets: ARBucket[]
  recentDenials: Array<{ denialReason: string; deniedAmount: number; status: string; id: string }>
}

// Bucket colours for the aging bars
const BUCKET_COLORS: Record<string, string> = {
  '0-30':  'bg-blue-500',
  '31-60': 'bg-yellow-500',
  '61-90': 'bg-orange-500',
  '90+':   'bg-red-500',
}

export function RevenueCyclePage() {
  const [data, setData]     = useState<RCMData | null>(null)
  const [arData, setArData] = useState<{ totalAR: number; buckets: ARBucket[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      // Dashboard endpoint is the canonical source of truth for all KPIs
      const [dashRes, arRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/ar/stats'),
      ])
      setData(dashRes.data as RCMData)
      setArData(arRes.data as { totalAR: number; buckets: ARBucket[] })
    } catch {
      setError('Failed to load revenue cycle data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Revenue Cycle Management</h1>
        <p className="page-subtitle">Monitor practice financial health and claim lifecycles.</p>
      </div>
      <SkeletonKPIs />
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={load} />

  const kpis    = data?.kpis
  const buckets = arData?.buckets ?? []
  const totalAR = arData?.totalAR ?? 0
  const denials = data?.recentDenials ?? []

  // Top denial reasons aggregated from real data
  const denialReasonMap: Record<string, { count: number; amount: number }> = {}
  for (const d of denials) {
    const key = d.denialReason || 'Unknown'
    if (!denialReasonMap[key]) denialReasonMap[key] = { count: 0, amount: 0 }
    denialReasonMap[key].count += 1
    denialReasonMap[key].amount += d.deniedAmount ?? 0
  }
  const topDenialReasons = Object.entries(denialReasonMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)
    .map(([reason, stats]) => ({ reason, ...stats }))

  // Total for aging bucket percentages
  const totalBucketBalance = buckets.reduce((s, b) => s + b.balance, 0)

  // Days in A/R = totalAR / (monthlyRevenue / 30). Avoid NaN.
  const daysInAR = kpis?.monthlyRevenue
    ? Math.round((totalAR / (kpis.monthlyRevenue / 30)) * 10) / 10
    : 0

  // Denial rate = openDenials / totalClaims × 100
  const denialRate = kpis?.totalClaims
    ? Math.round((Number(kpis.openDenials ?? 0) / Number(kpis.totalClaims)) * 1000) / 10
    : 0

  // Clean claim rate = 100 - denialRate  (rough proxy until backend provides it)
  const cleanClaimRate = Math.max(0, 100 - denialRate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Revenue Cycle Management</h1>
          <p className="page-subtitle">Monitor practice financial health and claim lifecycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs from real database */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total A/R"
          value={totalAR}
          format="currency"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          colorClass="bg-blue-50"
        />
        <KPICard
          title="Days in A/R"
          value={daysInAR}
          icon={<TrendingUp className="w-5 h-5 text-yellow-600" />}
          colorClass="bg-yellow-50"
        />
        <KPICard
          title="Clean Claim Rate"
          value={cleanClaimRate}
          format="percent"
          icon={<FileText className="w-5 h-5 text-green-600" />}
          colorClass="bg-green-50"
        />
        <KPICard
          title="Denial Rate"
          value={denialRate}
          format="percent"
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          colorClass="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A/R Aging Summary — real data */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">A/R Aging Summary</h3>
          {buckets.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No outstanding A/R — all claims are paid or no claims exist yet.</p>
          ) : (
            <div className="space-y-4">
              {buckets.map((bucket) => {
                const pct = totalBucketBalance > 0
                  ? Math.round((bucket.balance / totalBucketBalance) * 100)
                  : 0
                return (
                  <div key={bucket.agingBucket}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{bucket.agingBucket} Days</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(bucket.balance)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`${BUCKET_COLORS[bucket.agingBucket] ?? 'bg-slate-400'} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Denial Reasons — real data */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Top Denial Reasons</h3>
          {topDenialReasons.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No open denials — great work!</p>
          ) : (
            <div className="space-y-3">
              {topDenialReasons.map(({ reason, count, amount }, i) => (
                <div key={reason} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{reason}</p>
                      <p className="text-xs text-slate-500">{count} {count === 1 ? 'claim' : 'claims'}</p>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-700 text-sm">
                    {formatCurrency(amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collection Rate context */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Collection Rate</h3>
        <p className="text-sm text-slate-500 mb-4">
          Percentage of billed amount successfully collected from paid/closed claims.
        </p>
        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold text-slate-900">
            {kpis?.collectionRate ?? 0}%
          </div>
          <div className="text-sm text-slate-500 pb-1">
            of {formatCurrency(kpis?.monthlyRevenue ?? 0)} billed this month
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, kpis?.collectionRate ?? 0)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
