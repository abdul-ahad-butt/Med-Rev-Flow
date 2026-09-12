import { useEffect, useState } from 'react'
import { Search, Filter, ShieldCheck, FileText, AlertTriangle, Clock } from 'lucide-react'
import api from '../api/client'
import { SkeletonTable } from '../components/ui/Skeleton'
import { KPICard } from '../components/ui/KPICard'

export function PriorAuthPage() {
  const [auths, setAuths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuths()
  }, [])

  const fetchAuths = async () => {
    try {
      // Simulate fetch since we might not have a specific endpoint, or use generic
      setTimeout(() => {
        setAuths([
          { id: 1, patient: 'Alice Smith', payer: 'Blue Cross', procedure: 'MRI Knee', status: 'Pending', date: '2023-11-01', urgent: true },
          { id: 2, patient: 'Bob Johnson', payer: 'Aetna', procedure: 'Physical Therapy', status: 'Approved', date: '2023-10-28', urgent: false },
          { id: 3, patient: 'Charlie Davis', payer: 'Medicare', procedure: 'CT Scan', status: 'Denied', date: '2023-10-25', urgent: false },
          { id: 4, patient: 'Diana Evans', payer: 'Cigna', procedure: 'Surgery', status: 'Submitted', date: '2023-11-02', urgent: true }
        ])
        setLoading(false)
      }, 800)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'denied': return 'bg-red-100 text-red-700'
      case 'pending':
      case 'submitted': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prior Authorizations</h1>
          <p className="text-slate-500">Manage and track insurance prior authorizations for procedures.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search patients or CPT..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            New Auth Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Active" value={142} icon={<FileText className="w-5 h-5 text-blue-600" />} />
        <KPICard title="Pending Approval" value={45} icon={<Clock className="w-5 h-5 text-yellow-600" />} />
        <KPICard title="Approved (7d)" value={89} icon={<ShieldCheck className="w-5 h-5 text-green-600" />} />
        <KPICard title="Denied (7d)" value={8} icon={<AlertTriangle className="w-5 h-5 text-red-600" />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={5} /> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Payer</th>
                <th className="px-6 py-4">Procedure</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auths.map(auth => (
                <tr key={auth.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      {auth.urgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {auth.patient}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{auth.payer}</td>
                  <td className="px-6 py-4">{auth.procedure}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(auth.status)}`}>
                      {auth.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{auth.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
