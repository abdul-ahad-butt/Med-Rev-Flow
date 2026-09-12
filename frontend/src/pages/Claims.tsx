import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, Filter } from 'lucide-react'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonTable, EmptyState, ErrorState } from '../components/ui/Skeleton'
import { formatCurrency, formatDate } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'
import { FileText } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'DENIED', label: 'Denied' },
  { value: 'REJECTED', label: 'Rejected' },
]

export function ClaimsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/claims', { params: { page, limit: 20, search, status } })
      setData(res.data)
    } catch {
      setError('Failed to load claims')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, status])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/claims/export', { responseType: 'blob', params: { status } })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'claims-export.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const body = {
        patientId: form.get('patientId'),
        billedAmount: Number(form.get('billedAmount')),
        dateOfService: form.get('dateOfService'),
        notes: form.get('notes'),
      }
      const res = await api.post('/claims', body)
      toast.success('Claim created')
      setShowCreate(false)
      navigate(`/app/claims/${(res.data.data as { id: string }).id}`)
    } catch {
      toast.error('Failed to create claim')
    } finally {
      setCreateLoading(false)
    }
  }

  const items = (data?.data as Record<string, unknown>[]) || []
  const meta = data?.meta as Record<string, number>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Claims Management</h1>
          <p className="page-subtitle">Track and manage all insurance claims</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} loading={exporting}>
            Export CSV
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>
            New Claim
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by claim # or patient..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-44">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={10} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="section-card">
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Claim #</th>
                  <th>Patient</th>
                  <th>Provider</th>
                  <th>Insurance</th>
                  <th>Date of Service</th>
                  <th>Billed</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        title="No claims found"
                        description="Try adjusting your filters or create a new claim."
                        icon={<FileText className="w-10 h-10" />}
                      />
                    </td>
                  </tr>
                ) : items.map((claim) => (
                  <tr
                    key={claim.id as string}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/claims/${claim.id}`)}
                  >
                    <td className="font-mono text-xs text-blue-600 font-semibold">{claim.claimNumber as string}</td>
                    <td className="font-medium">
                      {(claim.patient as { firstName: string; lastName: string })?.firstName}{' '}
                      {(claim.patient as { firstName: string; lastName: string })?.lastName}
                    </td>
                    <td className="text-slate-600">
                      Dr. {(claim.provider as { lastName: string })?.lastName}
                    </td>
                    <td className="text-slate-600">{(claim.insurance as { name: string })?.name}</td>
                    <td className="text-slate-500">{formatDate(claim.dateOfService as string)}</td>
                    <td className="font-medium">{formatCurrency(claim.billedAmount as number)}</td>
                    <td className={`font-medium ${(claim.paidAmount as number) > 0 ? 'text-green-700' : 'text-slate-400'}`}>
                      {(claim.paidAmount as number) > 0 ? formatCurrency(claim.paidAmount as number) : '—'}
                    </td>
                    <td><StatusBadge status={claim.status as string} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <Pagination
              page={meta.page}
              pages={meta.pages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* Create Claim Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Claim"
        description="Enter claim details to create a new billing record"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" form="create-claim-form" loading={createLoading}>Create Claim</Button>
          </>
        }
      >
        <form id="create-claim-form" onSubmit={handleCreate} className="space-y-4">
          <Input label="Patient ID" name="patientId" placeholder="P-001001" required />
          <Input label="Date of Service" name="dateOfService" type="date" required />
          <Input label="Billed Amount ($)" name="billedAmount" type="number" min="0" step="0.01" placeholder="0.00" required />
          <Input label="Notes" name="notes" placeholder="Optional notes..." />
        </form>
      </Modal>
    </div>
  )
}
