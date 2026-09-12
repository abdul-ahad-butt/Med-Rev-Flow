import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, DollarSign, User, Building2, Calendar, Edit2, CheckCircle } from 'lucide-react'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Input'
import { SkeletonCard, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PENDING', 'DENIED'],
  PENDING: ['PAID', 'DENIED'],
  REJECTED: ['SUBMITTED'],
  DENIED: ['SUBMITTED'],
}

export function ClaimDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showStatus, setShowStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/claims/${id}`)
      setClaim(res.data.data)
    } catch {
      setError('Claim not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    setStatusLoading(true)
    try {
      await api.patch(`/claims/${id}/status`, { status: newStatus })
      toast.success('Claim status updated')
      setShowStatus(false)
      await load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (error || !claim) return <ErrorState message={error} onRetry={load} />

  const currentStatus = claim.status as string
  const nextStatuses = STATUS_TRANSITIONS[currentStatus] || []
  const patient = claim.patient as Record<string, string>
  const provider = claim.provider as Record<string, string>
  const insurance = claim.insurance as Record<string, string>
  const payments = (claim.payments as unknown[]) || []
  const denials = (claim.denials as unknown[]) || []
  const statusHistory = (claim.statusHistory as unknown[]) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">{claim.claimNumber as string}</h1>
            <p className="page-subtitle">Date of service: {formatDate(claim.dateOfService as string)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          {nextStatuses.length > 0 && (
            <Button size="sm" leftIcon={<Edit2 className="w-3 h-3" />} onClick={() => setShowStatus(true)}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Financials */}
        {[
          { label: 'Billed Amount', value: claim.billedAmount as number },
          { label: 'Allowed Amount', value: claim.allowedAmount as number },
          { label: 'Paid Amount', value: claim.paidAmount as number },
          { label: 'Patient Balance', value: claim.patientBalance as number },
        ].map(({ label, value }) => (
          <div key={label} className="section-card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(value || 0)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Claim Info */}
        <div className="section-card xl:col-span-2">
          <div className="section-card-header">
            <h2 className="section-card-title flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Claim Details
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Patient</p>
              <Link to={`/app/patients/${patient?.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                {patient?.firstName} {patient?.lastName}
              </Link>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Provider</p>
              <p className="text-sm font-medium">Dr. {provider?.firstName} {provider?.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Insurance</p>
              <p className="text-sm font-medium">{insurance?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Member ID</p>
              <p className="text-sm font-mono">{patient?.memberId || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">ICD Codes</p>
              <p className="text-sm font-mono">{(claim.icdCodes as string[])?.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">CPT Codes</p>
              <p className="text-sm font-mono">{(claim.cptCodes as string[])?.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Submitted Date</p>
              <p className="text-sm">{formatDate(claim.submittedDate as string)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Days Outstanding</p>
              <p className="text-sm font-medium">{claim.daysOutstanding as number} days</p>
            </div>
            {claim.notes && (
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-0.5">Notes</p>
                <p className="text-sm text-slate-700">{claim.notes as string}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status History */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Status Timeline
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {statusHistory.map((h, i) => {
              const hist = h as Record<string, string>
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{hist.toStatus}</p>
                    <p className="text-xs text-slate-500">{formatDate(hist.changedAt)}</p>
                    {hist.notes && <p className="text-xs text-slate-600 mt-0.5">{hist.notes}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Payments */}
      {payments.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Payments
            </h2>
          </div>
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Paid Date</th>
                  <th>Amount</th>
                  <th>Adjustment</th>
                  <th>Method</th>
                  <th>ERA/Check #</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const pay = p as Record<string, unknown>
                  return (
                    <tr key={pay.id as string}>
                      <td>{formatDate(pay.paidDate as string)}</td>
                      <td className="text-green-700 font-medium">{formatCurrency(pay.amount as number)}</td>
                      <td>{formatCurrency(pay.adjustmentAmount as number)}</td>
                      <td>{pay.paymentMethod as string}</td>
                      <td className="font-mono text-xs">{(pay.eraNumber || pay.checkNumber || '—') as string}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Denials */}
      {denials.length > 0 && (
        <div className="section-card border-red-100">
          <div className="section-card-header bg-red-50/50">
            <h2 className="section-card-title flex items-center gap-2 text-red-700">
              Denials
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {denials.map((d) => {
              const denial = d as Record<string, unknown>
              return (
                <div key={denial.id as string} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">{denial.denialReason as string}</p>
                    <p className="text-xs text-slate-500">Code: {denial.denialCode as string} • {formatCurrency(denial.deniedAmount as number)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={denial.status as string} />
                    <Link to={`/app/denials/${denial.id}`} className="text-xs text-blue-600 hover:underline">
                      View →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <Modal
        open={showStatus}
        onClose={() => setShowStatus(false)}
        title="Update Claim Status"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowStatus(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} loading={statusLoading} disabled={!newStatus}>
              Update
            </Button>
          </>
        }
      >
        <Select
          label="New Status"
          options={nextStatuses.map(s => ({ value: s, label: s }))}
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          placeholder="Select status..."
        />
      </Modal>
    </div>
  )
}
