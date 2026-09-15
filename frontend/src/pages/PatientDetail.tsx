import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { SkeletonCard, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'

export function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/patients/${id}`)
      setPatient(res.data.data)
    } catch {
      setError('Patient not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (error || !patient) return <ErrorState message={error} onRetry={load} />

  const claims = (patient.claims as unknown[]) || []
  const appointments = (patient.appointments as unknown[]) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">{patient.firstName as string} {patient.lastName as string}</h1>
            <p className="page-subtitle">DOB: {patient.dateOfBirth ? formatDate(patient.dateOfBirth as string) : 'Unknown'}</p>
          </div>
        </div>
        <Button size="sm" variant="secondary">Edit Patient</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column: Demographics & Contact */}
        <div className="space-y-5">
          <div className="section-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Demographics
            </h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 text-slate-500">
                <span className="col-span-1">Gender</span>
                <span className="col-span-2 font-medium text-slate-900 capitalize">{patient.gender as string || '—'}</span>
              </div>
              <div className="grid grid-cols-3 text-slate-500">
                <span className="col-span-1">Member ID</span>
                <span className="col-span-2 font-medium text-slate-900 font-mono">{patient.memberId as string || '—'}</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Contact Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" /> {patient.phone as string || 'No phone'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" /> {patient.email as string || 'No email'}
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> 
                <span>
                  {patient.addressLine1 as string || 'No address provided'}
                  {patient.city && <><br/>{patient.city as string}, {patient.state as string} {patient.zipCode as string}</>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Claims & Appointments */}
        <div className="xl:col-span-2 space-y-5">
          {/* Claims History */}
          <div className="section-card">
            <div className="section-card-header flex items-center justify-between">
              <h2 className="section-card-title flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Claims History
              </h2>
              <span className="text-xs text-slate-500">{claims.length} total</span>
            </div>
            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No claims found for this patient.</div>
            ) : (
              <div className="table-container">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Claim #</th>
                      <th>DOS</th>
                      <th>Billed</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((c) => {
                      const claim = c as Record<string, unknown>
                      return (
                        <tr key={claim.id as string} className="cursor-pointer" onClick={() => navigate(`/app/claims/${claim.id}`)}>
                          <td className="font-mono text-xs text-blue-600">{claim.claimNumber as string}</td>
                          <td>{formatDate(claim.dateOfService as string)}</td>
                          <td>{formatCurrency(claim.billedAmount as number)}</td>
                          <td className="font-medium text-slate-900">{formatCurrency(claim.balance as number)}</td>
                          <td><StatusBadge status={claim.status as string} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Appointments */}
          <div className="section-card">
            <div className="section-card-header flex items-center justify-between">
              <h2 className="section-card-title flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Appointments
              </h2>
            </div>
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No appointments scheduled.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((a) => {
                  const apt = a as Record<string, unknown>
                  return (
                    <div key={apt.id as string} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{formatDate(apt?.startTime != null ? (apt.startTime as string) : '')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {apt?.appointmentType as string} with Dr. {(apt?.provider as { lastName: string })?.lastName}
                        </p>
                      </div>
                      <StatusBadge status={apt.status as string} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
