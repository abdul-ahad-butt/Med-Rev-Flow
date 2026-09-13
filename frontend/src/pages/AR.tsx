import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonTable, EmptyState, ErrorState } from '../components/ui/Skeleton'
import { KPICard } from '../components/ui/KPICard'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'

export function ARPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [dataRes, statsRes] = await Promise.all([
        api.get('/ar', { params: { page, limit: 20, search } }),
        page === 1 ? api.get('/ar/summary') : Promise.resolve(null),
      ])
      setData(dataRes.data)
      if (statsRes) setStats(statsRes.data)
    } catch {
      setError('Failed to load A/R data')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const items = (data?.data as Record<string, unknown>[]) || []
  const meta = data?.meta as Record<string, number>
  const buckets = (stats?.buckets as unknown[]) || []

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Receivable</h1>
          <p className="page-subtitle">Track outstanding balances by aging buckets</p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export A/R Report
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <KPICard title="Total Outstanding A/R" value={Number(stats.totalAR || 0)} format="currency" colorClass="bg-blue-50" />
            <KPICard title="0-30 Days" value={Number((buckets.find((b: unknown) => (b as { agingBucket: string }).agingBucket === '0-30') as { _sum: { balance: number } })?._sum?.balance || 0)} format="currency" colorClass="bg-green-50" />
            <KPICard title="31-60 Days" value={Number((buckets.find((b: unknown) => (b as { agingBucket: string }).agingBucket === '31-60') as { _sum: { balance: number } })?._sum?.balance || 0)} format="currency" colorClass="bg-yellow-50" />
            <KPICard title="90+ Days" value={Number((buckets.find((b: unknown) => (b as { agingBucket: string }).agingBucket === '90+') as { _sum: { balance: number } })?._sum?.balance || 0)} format="currency" colorClass="bg-red-50" />
          </div>
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">A/R Aging Distribution</h2>
            </div>
            <div className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="agingBucket" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Balance']} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="_sum.balance" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <th>Date of Service</th>
                  <th>Days Out</th>
                  <th>Bucket</th>
                  <th>Billed</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState title="No outstanding A/R" icon={<Clock className="w-10 h-10" />} /></td></tr>
                ) : items.map((c) => (
                  <tr key={c.id as string} className="cursor-pointer" onClick={() => navigate(`/app/claims/${c.id}`)}>
                    <td className="font-mono text-xs text-blue-600">{c.claimNumber as string}</td>
                    <td>{(c.patient as { firstName: string; lastName: string })?.firstName} {(c.patient as { firstName: string; lastName: string })?.lastName}</td>
                    <td className="text-slate-500">{formatDate(c.dateOfService as string)}</td>
                    <td className="font-medium text-slate-700">{c.daysOutstanding as number}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        (c.agingBucket as string) === '90+' ? 'bg-red-100 text-red-700' :
                        (c.agingBucket as string) === '61-90' ? 'bg-orange-100 text-orange-700' :
                        (c.agingBucket as string) === '31-60' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {c.agingBucket as string}
                      </span>
                    </td>
                    <td>{formatCurrency(c.billedAmount as number)}</td>
                    <td className="text-green-700">{formatCurrency(c.paidAmount as number)}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(c.balance as number)}</td>
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
