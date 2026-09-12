import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Stethoscope, Mail, Phone } from 'lucide-react'
import api from '../api/client'
import { SkeletonTable } from '../components/ui/Skeleton'

export function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await api.get('/providers')
      setProviders(res.data.data)
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
          <h1 className="text-2xl font-bold text-slate-800">Providers</h1>
          <p className="text-slate-500">Manage healthcare providers and staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search providers..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Plus className="w-4 h-4" /> Add Provider
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={5} /> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">NPI</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {providers.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{p.firstName} {p.lastName}, {p.credentials}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5"><Stethoscope className="w-4 h-4 text-slate-400"/> {p.specialty || 'General'}</span></td>
                  <td className="px-6 py-4 space-y-1 text-slate-500">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3"/> {p.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3"/> {p.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.npi}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No providers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
