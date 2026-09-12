import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Phone, Mail, MoreHorizontal, User, Calendar, ExternalLink } from 'lucide-react'
import api from '../api/client'
import { KPICard } from '../components/ui/KPICard'
import { Badge } from '../components/ui/Badge'
import { SkeletonLine } from '../components/ui/Skeleton'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  source: string | null
  service: string | null
  status: string
  createdAt: string
}

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const res = await api.get('/leads')
      setLeads(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch leads', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <Badge variant="error">New</Badge>
      case 'CONTACTED': return <Badge variant="warning">Contacted</Badge>
      case 'QUALIFIED': return <Badge variant="success">Qualified</Badge>
      case 'CONVERTED': return <Badge variant="success">Converted</Badge>
      case 'CLOSED': return <Badge variant="neutral">Closed</Badge>
      default: return <Badge variant="neutral">{status}</Badge>
    }
  }

  const filteredLeads = leads.filter(l => 
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const newLeadsCount = leads.filter(l => l.status === 'NEW').length
  const qualifiedCount = leads.filter(l => l.status === 'QUALIFIED').length
  const convertedCount = leads.filter(l => l.status === 'CONVERTED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leads & CRM</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage prospective patients and marketing growth.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Leads" value={leads.length} icon={<User className="w-5 h-5 text-indigo-600" />} />
        <KPICard title="New (Uncontacted)" value={newLeadsCount} icon={<ExternalLink className="w-5 h-5 text-rose-600" />} trend={12} />
        <KPICard title="Qualified" value={qualifiedCount} icon={<Search className="w-5 h-5 text-amber-600" />} />
        <KPICard title="Converted" value={convertedCount} icon={<Calendar className="w-5 h-5 text-emerald-600" />} trend={5} />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads by name or email..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service of Interest</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4"><SkeletonLine className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><SkeletonLine className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><SkeletonLine className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><SkeletonLine className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><SkeletonLine className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><SkeletonLine className="h-4 w-24" /></td>
                    <td className="px-6 py-4 text-right"><SkeletonLine className="h-8 w-8 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-white">{lead.firstName} {lead.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {lead.email && (
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Phone className="w-3.5 h-3.5 mr-1.5" />
                            {lead.phone}
                          </div>
                        )}
                        {!lead.email && !lead.phone && <span className="text-sm text-slate-400 italic">No contact info</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {lead.source || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {lead.service || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No leads found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      We couldn't find any leads matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

