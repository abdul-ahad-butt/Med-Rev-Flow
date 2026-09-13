import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { Select } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonTable, EmptyState, ErrorState } from '../components/ui/Skeleton'
import { KPICard } from '../components/ui/KPICard'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'
import { AlertCircle } from 'lucide-react'

export function DenialsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [dataRes, statsRes] = await Promise.all([
        api.get('/denials', { params: { page, limit: 20, status, search } }),
        page === 1 ? api.get('/denials/summary') : Promise.resolve(null),
      ])
      setData(dataRes.data)
      if (statsRes) setStats(statsRes.data)
    } catch {
      setError('Failed to load denials')
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status, search])

  const items = (data?.data as Record<string, unknown>[]) || []
  const meta = data?.meta as Record<string, number>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Denial Management</h1>
          <p className="page-subtitle">Track, appeal, and resolve denied claims</p>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Denials" value={(stats.byStatus as unknown[])?.reduce((s: number, b: unknown) => s + ((b as { _count: number })._count), 0) || 0} />
          <KPICard title="Total Denied" value={Number(stats.totalDenied || 0)} format="currency" />
          <KPICard title="Total Recovered" value={Number(stats.totalRecovered || 0)} format="currency" />
          <KPICard title="Recovery Rate" value={Number(stats.recoveryRate || 0)} format="percent" />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search denials..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'NEW', label: 'New' },
              { value: 'UNDER_REVIEW', label: 'Under Review' },
              { value: 'DOCUMENTATION_NEEDED', label: 'Docs Needed' },
              { value: 'APPEAL_SUBMITTED', label: 'Appeal Submitted' },
              { value: 'RESOLVED', label: 'Resolved' },
            ]}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {loading ? <SkeletonTable rows={10} /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="section-card">
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Patient</th>
                  <th>Denial Reason</th>
                  <th>Denied Amount</th>
                  <th>Recovered</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Follow Up</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9}><EmptyState title="No denials found" icon={<AlertCircle className="w-10 h-10" />} /></td></tr>
                ) : items.map((d) => (
                  <tr key={d.id as string} className="cursor-pointer" onClick={() => navigate(`/app/denials/${d.id}`)}>
                    <td className="font-mono text-xs text-blue-600">{(d.claim as { claimNumber: string })?.claimNumber}</td>
                    <td>{(d.claim as { patient: { firstName: string; lastName: string } })?.patient?.firstName} {(d.claim as { patient: { firstName: string; lastName: string } })?.patient?.lastName}</td>
                    <td className="max-w-[180px] truncate text-slate-700">{d.denialReason as string}</td>
                    <td className="text-red-700 font-medium">{formatCurrency(d.deniedAmount as number)}</td>
                    <td className="text-green-700">{d.recoveredAmount ? formatCurrency(d.recoveredAmount as number) : '—'}</td>
                    <td><PriorityBadge priority={d.priority as string} /></td>
                    <td><StatusBadge status={d.status as string} /></td>
                    <td>{(d.assignedTo as { firstName: string; lastName: string })?.firstName || '—'}</td>
                    <td className="text-slate-500">{d.followUpDate ? formatDate(d.followUpDate as string) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPageChange={setPage} />}
        </div>
      )}
    </div>
  )
}
