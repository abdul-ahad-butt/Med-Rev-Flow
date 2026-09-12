import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, FileText, AlertCircle, TrendingUp, Clock, Users,
  CheckSquare, Activity, ArrowRight, MoreHorizontal
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { KPICard } from '../components/ui/KPICard'
import { StatusBadge } from '../components/ui/Badge'
import { SkeletonKPIs, SkeletonTable, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/dashboard')
      setStats(res.data)
    } catch {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Practice Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your practice performance</p>
      </div>
      <SkeletonKPIs />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><SkeletonTable rows={5} /></div>
        <SkeletonTable rows={5} cols={2} />
      </div>
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={load} />

  const kpis = (stats?.kpis as Record<string, number>) || {}
  const claims = (stats?.recentClaims as unknown[]) || []
  const denials = (stats?.recentDenials as unknown[]) || []
  const monthly = (stats?.monthlyRevenue as unknown[]) || []
  const byStatus = (stats?.claimsByStatus as unknown[]) || []
  const arBuckets = (stats?.arBuckets as unknown[]) || []

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Practice Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your revenue cycle performance</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Monthly Revenue"
          value={kpis.monthlyRevenue || 0}
          format="currency"
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          colorClass="bg-green-50"
          onClick={() => navigate('/app/revenue-cycle')}
        />
        <KPICard
          title="Total Claims"
          value={kpis.totalClaims || 0}
          icon={<FileText className="w-4 h-4 text-blue-600" />}
          colorClass="bg-blue-50"
          onClick={() => navigate('/app/claims')}
        />
        <KPICard
          title="Open Denials"
          value={kpis.openDenials || 0}
          icon={<AlertCircle className="w-4 h-4 text-red-600" />}
          colorClass="bg-red-50"
          onClick={() => navigate('/app/denials')}
        />
        <KPICard
          title="Collection Rate"
          value={kpis.collectionRate || 0}
          format="percent"
          icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
          colorClass="bg-purple-50"
        />
        <KPICard
          title="Pending A/R"
          value={kpis.pendingAR || 0}
          format="currency"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          colorClass="bg-amber-50"
          onClick={() => navigate('/app/ar')}
        />
        <KPICard
          title="Active Patients"
          value={kpis.activePatients || 0}
          icon={<Users className="w-4 h-4 text-cyan-600" />}
          colorClass="bg-cyan-50"
          onClick={() => navigate('/app/patients')}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="xl:col-span-2 section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Monthly Revenue Trend</h2>
            <span className="text-xs text-slate-500">Last 12 months</span>
          </div>
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims by Status */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Claims by Status</h2>
          </div>
          <div className="p-4 h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="_count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, _count }) => `${_count}`}>
                  {(byStatus as { status: string; _count: number }[]).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 space-y-1">
            {(byStatus as { status: string; _count: number }[]).slice(0, 4).map((s, i) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{s.status}</span>
                </div>
                <span className="font-medium text-slate-900">{s._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: A/R Aging + Recent Claims + Denials */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* A/R Aging */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">A/R Aging Buckets</h2>
            <button onClick={() => navigate('/app/ar')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arBuckets} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="agingBucket" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={(v: number) => [formatCurrency(v)]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="_sum.balance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="section-card xl:col-span-2">
          <div className="section-card-header">
            <h2 className="section-card-title">Recent Claims</h2>
            <button onClick={() => navigate('/app/claims')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Patient</th>
                  <th>Date of Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(claims as Record<string, unknown>[]).map((claim) => (
                  <tr
                    key={claim.id as string}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/claims/${claim.id}`)}
                  >
                    <td className="font-mono text-xs text-blue-600 font-medium">{claim.claimNumber as string}</td>
                    <td>{(claim.patient as { firstName: string; lastName: string })?.firstName} {(claim.patient as { firstName: string; lastName: string })?.lastName}</td>
                    <td className="text-slate-500">{formatDate(claim.dateOfService as string)}</td>
                    <td className="font-medium">{formatCurrency(claim.billedAmount as number)}</td>
                    <td><StatusBadge status={claim.status as string} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Tasks & Denials quick view */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quick Task list */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Open Tasks</h2>
            <button onClick={() => navigate('/app/tasks')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {((stats?.tasks as unknown[]) || []).slice(0, 5).map((t: unknown) => {
              const task = t as Record<string, unknown>
              return (
                <div key={task.id as string} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <CheckSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title as string}</p>
                    <p className="text-xs text-slate-500">Due {formatDate(task.dueDate as string)}</p>
                  </div>
                  <StatusBadge status={task.priority as string} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Denials */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Recent Denials</h2>
            <button onClick={() => navigate('/app/denials')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Reason</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(denials as Record<string, unknown>[]).slice(0, 5).map((d) => (
                  <tr key={d.id as string} className="cursor-pointer" onClick={() => navigate(`/app/denials/${d.id}`)}>
                    <td className="font-mono text-xs">{(d.claim as { claimNumber: string })?.claimNumber}</td>
                    <td className="max-w-[150px] truncate text-slate-600">{d.denialReason as string}</td>
                    <td className="font-medium text-red-600">{formatCurrency(d.deniedAmount as number)}</td>
                    <td><StatusBadge status={d.status as string} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
