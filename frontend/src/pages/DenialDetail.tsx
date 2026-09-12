// Denial Detail page
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Send, FileText } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { SkeletonCard, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency, formatDate, formatDateTime } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth.store'

export function DenialDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [denial, setDenial] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [showAppeal, setShowAppeal] = useState(false)
  const [appealReason, setAppealReason] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [appealLoading, setAppealLoading] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/denials/${id}`)
      setDenial(res.data.data)
    } catch {
      setError('Denial not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const addNote = async () => {
    if (!note.trim()) return
    setNoteLoading(true)
    try {
      await api.post(`/denials/${id}/notes`, { content: note, userId: user?.id })
      toast.success('Note added')
      setNote('')
      await load()
    } catch {
      toast.error('Failed to add note')
    } finally {
      setNoteLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!newStatus) return
    setStatusLoading(true)
    try {
      await api.patch(`/denials/${id}`, { status: newStatus })
      toast.success('Status updated')
      setShowStatus(false)
      await load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  const submitAppeal = async () => {
    if (!appealReason.trim()) return
    setAppealLoading(true)
    try {
      await api.post(`/denials/${id}/appeal`, { reason: appealReason, submittedDate: new Date().toISOString() })
      toast.success('Appeal submitted')
      setShowAppeal(false)
      setAppealReason('')
      await load()
    } catch {
      toast.error('Failed to submit appeal')
    } finally {
      setAppealLoading(false)
    }
  }

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (error || !denial) return <ErrorState message={error} onRetry={load} />

  const notes = (denial.notes as unknown[]) || []
  const appeals = (denial.appeals as unknown[]) || []
  const claim = denial.claim as Record<string, unknown>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">Denial — {(claim as { claimNumber: string })?.claimNumber}</h1>
            <p className="page-subtitle">{denial.denialReason as string}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={denial.priority as string} />
          <StatusBadge status={denial.status as string} />
          <Button size="sm" variant="secondary" onClick={() => setShowStatus(true)}>Update Status</Button>
          <Button size="sm" leftIcon={<FileText className="w-3 h-3" />} onClick={() => setShowAppeal(true)}>Submit Appeal</Button>
        </div>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="section-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Denied Amount</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(denial.deniedAmount as number)}</p>
        </div>
        <div className="section-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recovered</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency((denial.recoveredAmount as number) || 0)}</p>
        </div>
        <div className="section-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Denial Code</p>
          <p className="text-xl font-bold font-mono">{denial.denialCode as string}</p>
        </div>
        <div className="section-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Follow Up Date</p>
          <p className="text-sm font-medium">{denial.followUpDate ? formatDate(denial.followUpDate as string) : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Notes */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Notes ({notes.length})
            </h2>
          </div>
          <div className="flex-1 space-y-3 p-4 max-h-64 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No notes yet. Add the first note below.</p>
            ) : notes.map((n, i) => {
              const note = n as Record<string, unknown>
              return (
                <div key={i} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">
                      {(note.user as { firstName: string; lastName: string })?.firstName} {(note.user as { firstName: string; lastName: string })?.lastName}
                    </span>
                    <span className="text-xs text-slate-500">{formatDateTime(note.createdAt as string)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{note.content as string}</p>
                </div>
              )
            })}
          </div>
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <Button size="sm" onClick={addNote} loading={noteLoading} leftIcon={<Send className="w-3 h-3" />}>Add</Button>
            </div>
          </div>
        </div>

        {/* Appeals */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Appeals ({appeals.length})</h2>
          </div>
          <div className="p-4 space-y-3">
            {appeals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No appeals submitted yet.</p>
            ) : appeals.map((a, i) => {
              const appeal = a as Record<string, unknown>
              return (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Submitted {formatDate(appeal.submittedDate as string)}</span>
                    {appeal.outcome && <StatusBadge status={appeal.outcome as string} />}
                  </div>
                  <p className="text-sm text-slate-700">{appeal.reason as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <Modal open={showStatus} onClose={() => setShowStatus(false)} title="Update Denial Status" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowStatus(false)}>Cancel</Button><Button onClick={updateStatus} loading={statusLoading} disabled={!newStatus}>Update</Button></>}>
        <Select
          label="New Status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          options={[
            { value: 'NEW', label: 'New' },
            { value: 'UNDER_REVIEW', label: 'Under Review' },
            { value: 'DOCUMENTATION_NEEDED', label: 'Documentation Needed' },
            { value: 'APPEAL_SUBMITTED', label: 'Appeal Submitted' },
            { value: 'RESOLVED', label: 'Resolved' },
          ]}
          placeholder="Select status..."
        />
      </Modal>

      {/* Appeal Modal */}
      <Modal open={showAppeal} onClose={() => setShowAppeal(false)} title="Submit Appeal" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowAppeal(false)}>Cancel</Button><Button onClick={submitAppeal} loading={appealLoading} disabled={!appealReason.trim()}>Submit Appeal</Button></>}>
        <Textarea
          label="Appeal Reason / Supporting Documentation"
          value={appealReason}
          onChange={(e) => setAppealReason(e.target.value)}
          placeholder="Describe why this claim should be reconsidered and provide supporting documentation..."
          className="min-h-[120px]"
        />
      </Modal>
    </div>
  )
}
