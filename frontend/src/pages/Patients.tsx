import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Calendar, Phone, Mail } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonTable, EmptyState, ErrorState } from '../components/ui/Skeleton'
import { formatDate } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'

export function PatientsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/patients', { params: { page, limit: 20, search } })
      setData(res.data)
    } catch {
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const body = {
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        dateOfBirth: form.get('dateOfBirth'),
        gender: form.get('gender'),
        email: form.get('email'),
        phone: form.get('phone'),
      }
      const res = await api.post('/patients', body)
      toast.success('Patient created')
      setShowCreate(false)
      navigate(`/app/patients/${(res.data as { id: string }).id}`)
    } catch {
      toast.error('Failed to create patient')
    } finally {
      setCreateLoading(false)
    }
  }

  const items = (data?.data as Record<string, unknown>[]) || []
  const meta = data?.meta as Record<string, number>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage patient demographics and records</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>
          New Patient
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? <SkeletonTable rows={10} /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="section-card">
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Total Claims</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState title="No patients found" icon={<Users className="w-10 h-10" />} /></td></tr>
                ) : items.map((p) => (
                  <tr key={p.id as string} className="cursor-pointer" onClick={() => navigate(`/app/patients/${p.id}`)}>
                    <td className="font-medium text-slate-900">{p.firstName as string} {p.lastName as string}</td>
                    <td className="text-slate-600">{p.dateOfBirth ? formatDate(p.dateOfBirth as string) : '—'}</td>
                    <td className="text-slate-600 capitalize">{p.gender as string || '—'}</td>
                    <td>
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {p.phone as string}</div>}
                        {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {p.email as string}</div>}
                      </div>
                    </td>
                    <td className="font-medium">{(p._count as { claims: number })?.claims || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPageChange={setPage} />}
        </div>
      )}

      {/* Create Patient Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Patient"
        footer={<><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" form="create-patient-form" loading={createLoading}>Create</Button></>}>
        <form id="create-patient-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required />
            <Input label="Last Name" name="lastName" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" name="dateOfBirth" type="date" required />
            <Select label="Gender" name="gender" options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" />
            <Input label="Phone" name="phone" type="tel" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
