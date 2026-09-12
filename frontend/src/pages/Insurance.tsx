import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Shield } from 'lucide-react'
import api from '../api/client'
import { SkeletonTable } from '../components/ui/Skeleton'

export function InsurancePage() {
  const [insurances, setInsurances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsurances()
  }, [])

  const fetchInsurances = async () => {
    try {
      const res = await api.get('/insurance')
      setInsurances(res.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insurance Payers</h1>
          <p className="text-slate-500">Manage insurance contracts, fee schedules, and payer rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search payers..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Plus className="w-4 h-4" /> Add Payer
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={5} /> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Payer Name</th>
                <th className="px-6 py-4">Payer ID</th>
                <th className="px-6 py-4">Network Status</th>
                <th className="px-6 py-4">Timely Filing</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {insurances.map(ins => (
                <tr key={ins.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 font-medium text-slate-800">
                      <Shield className="w-4 h-4 text-blue-500" />
                      {ins.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{ins.payerId}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                      In-Network
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {ins.timelyFilingDays} days
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
              {insurances.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No insurance payers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
