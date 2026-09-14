import { useEffect, useState } from 'react'
import { Building2, Users, MapPin, Save, Plus, Edit2, Shield, AlertCircle, Key, UserX, UserCheck } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/auth.store'

export function SettingsPage() {
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('practice')
  const [loading, setLoading] = useState(false)
  const [practice, setPractice] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'VIEWER' })
  const [creatingUser, setCreatingUser] = useState(false)
  const [newCredentials, setNewCredentials] = useState<{email: string, temporaryPassword: string} | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    specialty: '',
    practiceType: '',
    taxId: '',
    npi: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'practice') {
        const res = await api.get('/settings/practice')
        setPractice(res.data.data)
        setFormData({
          name: res.data.data.name || '',
          legalName: res.data.data.legalName || '',
          specialty: res.data.data.specialty || '',
          practiceType: res.data.data.practiceType || '',
          taxId: res.data.data.taxId || '',
          npi: res.data.data.npi || '',
          phone: res.data.data.phone || '',
          email: res.data.data.email || '',
          address: res.data.data.address || '',
          city: res.data.data.city || '',
          state: res.data.data.state || '',
          zipCode: res.data.data.zipCode || ''
        })
      } else if (activeTab === 'users') {
        const res = await api.get('/settings/users')
        setUsers(res.data.data)
      } else if (activeTab === 'locations') {
        const res = await api.get('/settings/locations')
        setLocations(res.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePractice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/settings/practice', formData)
      toast.success('Practice settings saved successfully.')
    } catch (error) {
      console.error('Failed to save practice settings', error)
      toast.error('Failed to save practice settings.')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const res = await api.post('/settings/users', newUser)
      toast.success('User created successfully')
      setNewCredentials(res.data.credentials)
      fetchData() // refresh user list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user')
    } finally {
      setCreatingUser(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.post(`/settings/users/${userId}/deactivate`)
        toast.success('User deactivated')
      } else {
        await api.post(`/settings/users/${userId}/activate`)
        toast.success('User activated')
      }
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change user status')
    }
  }

  const resetPassword = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return
    try {
      const res = await api.post(`/settings/users/${userId}/reset-password`)
      setNewCredentials(res.data.credentials)
      setIsUserModalOpen(true) // Reuse modal to show credentials
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password')
    }
  }

  const renderContent = () => {
    if (loading && !practice && users.length === 0 && locations.length === 0) {
      return <div className="mt-6 p-8 text-center text-slate-500">Loading settings...</div>
    }

    if (activeTab === 'practice') {
      return (
        <form onSubmit={handleSavePractice} className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">Practice Details</h3>
            <p className="text-sm text-slate-500">Manage your organization's core information.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Practice Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name</label>
                <input type="text" value={formData.legalName} onChange={e => setFormData({...formData, legalName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID</label>
                <input type="text" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NPI</label>
                <input type="text" value={formData.npi} onChange={e => setFormData({...formData, npi: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Practice Type</label>
                <select value={formData.practiceType} onChange={e => setFormData({...formData, practiceType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select...</option>
                  <option value="Solo Practice">Solo Practice</option>
                  <option value="Group Practice">Group Practice</option>
                  <option value="Hospital Owned">Hospital Owned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                  <input type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )
    }

    if (activeTab === 'users') {
      return (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
            {currentUser?.role === 'PRACTICE_OWNER' && (
              <button 
                onClick={() => {
                  setNewUser({ firstName: '', lastName: '', email: '', role: 'VIEWER' })
                  setNewCredentials(null)
                  setIsUserModalOpen(true)
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{user.firstName} {user.lastName} {user.id === currentUser?.id && '(You)'}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      {currentUser?.role === 'PRACTICE_OWNER' && user.id !== currentUser?.id && user.role !== 'PRACTICE_OWNER' && (
                        <>
                          <button onClick={() => toggleUserStatus(user.id, user.isActive)} className="text-slate-600 hover:text-blue-600 text-sm font-medium inline-flex items-center gap-1">
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {user.isActive ? ' Deactivate' : ' Activate'}
                          </button>
                          <button onClick={() => resetPassword(user.id)} className="text-slate-600 hover:text-amber-600 text-sm font-medium inline-flex items-center gap-1">
                            <Key className="w-4 h-4" /> Reset PW
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Modal */}
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-semibold text-slate-800">
                    {newCredentials ? 'Credentials Generated' : 'Add New Staff Member'}
                  </h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                
                <div className="p-6">
                  {newCredentials ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Important: Save these credentials</p>
                          <p>This temporary password is only shown once. The user will be forced to change it upon first login.</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 font-mono text-sm">
                        <div><span className="text-slate-500">Email:</span> <br/><span className="font-semibold text-slate-800">{newCredentials.email}</span></div>
                        <div><span className="text-slate-500">Temp Password:</span> <br/><span className="font-semibold text-slate-800 tracking-wider text-base">{newCredentials.temporaryPassword}</span></div>
                      </div>
                      <button onClick={() => setIsUserModalOpen(false)} className="w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900">
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                          <input required type="text" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                          <input required type="text" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-3 py-2 border rounded-md bg-white focus:ring-blue-500 focus:border-blue-500">
                          <option value="PRACTICE_MANAGER">Practice Manager</option>
                          <option value="BILLING_STAFF">Billing Staff</option>
                          <option value="FRONT_DESK">Front Desk</option>
                          <option value="MARKETING_MANAGER">Marketing Manager</option>
                          <option value="VIEWER">Viewer (Read Only)</option>
                        </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={creatingUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                          {creatingUser ? 'Creating...' : 'Create User'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'locations') {
      return (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Locations</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {locations.length > 0 ? locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">{loc.name}</td>
                    <td className="px-6 py-4">{loc.facilityType}</td>
                    <td className="px-6 py-4">
                      <div>{loc.address}</div>
                      <div className="text-slate-500 text-xs">{loc.city}, {loc.state} {loc.zipCode}</div>
                    </td>
                    <td className="px-6 py-4">{loc.phone}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No locations found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your practice configuration, users, and billing details.</p>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center whitespace-nowrap gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'practice' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" /> Practice Profile
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center whitespace-nowrap gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" /> Users & Roles
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center whitespace-nowrap gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'locations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" /> Locations
        </button>
      </div>

      {renderContent()}
    </div>
  )
}
