import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react'
import api from '../api/client'
import { SkeletonTable } from '../components/ui/Skeleton'

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments')
      setAppointments(res.data.data)
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
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500">Manage patient scheduling and visits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search appointments..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <SkeletonTable rows={5} /> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Type / Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {new Date(a.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {a.time} ({a.duration} min)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <User className="w-4 h-4 text-slate-400" />
                      {a.patient?.firstName} {a.patient?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    Dr. {a.provider?.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {a.type}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{a.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-slate-500 hover:text-blue-600 font-medium text-sm">Reschedule</button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
