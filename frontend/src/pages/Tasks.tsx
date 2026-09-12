import { useEffect, useState, useCallback } from 'react'
import { Plus, CheckSquare, Search } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SkeletonTable, EmptyState, ErrorState } from '../components/ui/Skeleton'
import { formatDate } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth.store'

export function TasksPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('PENDING')
  const [showCreate, setShowCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/tasks', { params: { page, limit: 20, status } })
      setData(res.data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const body = {
        title: form.get('title'),
        description: form.get('description'),
        priority: form.get('priority'),
        dueDate: form.get('dueDate'),
        assignedToId: user?.id, // Assign to self for demo
      }
      await api.post('/tasks', body)
      toast.success('Task created')
      setShowCreate(false)
      load()
    } catch {
      toast.error('Failed to create task')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId)
    try {
      await api.patch(`/tasks/${taskId}`, { status: 'COMPLETED' })
      toast.success('Task marked as completed')
      load()
    } catch {
      toast.error('Failed to complete task')
    } finally {
      setCompleting(null)
    }
  }

  const items = (data?.data as Record<string, unknown>[]) || []
  const meta = data?.meta as Record<string, number>

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your workflow and to-dos</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>
          New Task
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Tasks' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {loading ? <SkeletonTable rows={10} /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="section-card">
          <div className="table-container">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState title="No tasks found" icon={<CheckSquare className="w-10 h-10" />} /></td></tr>
                ) : items.map((t) => (
                  <tr key={t.id as string}>
                    <td className="w-12">
                      {(t.status as string) !== 'COMPLETED' && (
                        <button
                          onClick={() => handleComplete(t.id as string)}
                          disabled={completing === t.id}
                          className="w-5 h-5 border-2 border-slate-300 rounded focus:outline-none hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {completing === t.id && <div className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" />}
                        </button>
                      )}
                    </td>
                    <td>
                      <p className={`font-medium ${(t.status as string) === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{t.title as string}</p>
                      {t.description && <p className="text-xs text-slate-500 max-w-[300px] truncate mt-0.5">{t.description as string}</p>}
                    </td>
                    <td><PriorityBadge priority={t.priority as string} /></td>
                    <td className="text-slate-600">{t.dueDate ? formatDate(t.dueDate as string) : '—'}</td>
                    <td>
                      {(t.assignedTo as { firstName: string; lastName: string }) ? 
                        `${(t.assignedTo as { firstName: string; lastName: string }).firstName} ${(t.assignedTo as { firstName: string; lastName: string }).lastName}` : 'Unassigned'}
                    </td>
                    <td><StatusBadge status={t.status as string} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPageChange={setPage} />}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task"
        footer={<><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" form="create-task-form" loading={createLoading}>Create</Button></>}>
        <form id="create-task-form" onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" name="title" required />
          <Input label="Description" name="description" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" name="priority" options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]} />
            <Input label="Due Date" name="dueDate" type="date" required />
          </div>
        </form>
      </Modal>
    </div>
  )
}
