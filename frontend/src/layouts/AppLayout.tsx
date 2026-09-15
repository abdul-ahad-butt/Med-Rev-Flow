import { hasPermission, Permission } from '../config/permissions';
import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, FileText, AlertCircle, DollarSign,
  Shield, Users, Calendar, UserCog, Building2, LineChart, BarChart3,
  CheckSquare, MessageSquare, Settings, LogOut, HelpCircle, Bell,
  Search, ChevronDown, Menu, X, Activity,
} from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { getInitials } from '../utils/cn'
import api from '../api/client'
import toast from 'react-hot-toast'

const NAV_ITEMS: { key: string, label: string, icon: any, path: string, permission: Permission }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard', permission: Permission.VIEW_DASHBOARD },
  { key: 'revenue-cycle', label: 'Revenue Cycle', icon: TrendingUp, path: '/app/revenue-cycle', permission: Permission.VIEW_CLAIMS },
  { key: 'claims', label: 'Claims', icon: FileText, path: '/app/claims', permission: Permission.VIEW_CLAIMS },
  { key: 'denials', label: 'Denials', icon: AlertCircle, path: '/app/denials', permission: Permission.VIEW_DENIALS },
  { key: 'ar', label: 'Accounts Receivable', icon: DollarSign, path: '/app/ar', permission: Permission.VIEW_AR },
  { key: 'prior-authorizations', label: 'Prior Authorization', icon: Shield, path: '/app/prior-authorizations', permission: Permission.VIEW_PATIENTS },
  { key: 'patients', label: 'Patients', icon: Users, path: '/app/patients', permission: Permission.VIEW_PATIENTS },
  { key: 'appointments', label: 'Appointments', icon: Calendar, path: '/app/appointments', permission: Permission.VIEW_APPOINTMENTS },
  { key: 'providers', label: 'Providers', icon: UserCog, path: '/app/providers', permission: Permission.VIEW_PROVIDERS },
  { key: 'insurance', label: 'Insurance', icon: Building2, path: '/app/insurance', permission: Permission.VIEW_INSURANCE },
  { key: 'marketing', label: 'Marketing & SEO', icon: LineChart, path: '/app/marketing', permission: Permission.VIEW_MARKETING },
  { key: 'leads', label: 'Leads & CRM', icon: Activity, path: '/app/leads', permission: Permission.VIEW_LEADS },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: '/app/reports', permission: Permission.VIEW_REPORTS },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/app/tasks', permission: Permission.VIEW_TASKS },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/app/messages', permission: Permission.VIEW_MESSAGES },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/app/settings', permission: Permission.MANAGE_PRACTICE_SETTINGS },
]


export function AppLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if (user && hasPermission(user.role, Permission.VIEW_MESSAGES)) {
      api.get('/messages/unread-count')
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(console.error)
    }
  }, [user, location.pathname])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearAuth()
      navigate('/login')
      toast.success('Logged out successfully')
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200 flex-shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-base">MedRevFlow</span>
            </div>
          ) : (
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Activity className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 sidebar-scroll space-y-0.5">
          {NAV_ITEMS.filter(item => hasPermission(user?.role, item.permission)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-200 py-3 px-2 space-y-0.5">
        {hasPermission(user?.role, Permission.VIEW_AUDIT_LOG) && (
          <NavLink
            to="/app/audit"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`}
            title={!sidebarOpen ? 'Audit Log' : undefined}
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Audit Log</span>}
          </NavLink>
        )}

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`sidebar-item w-full ${!sidebarOpen ? 'justify-center px-2' : ''}`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium text-slate-900 truncate">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, patients, tasks..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Practice name */}
            {sidebarOpen && (
              <div className="text-xs text-slate-500 hidden sm:block">
                {user?.practiceName}
              </div>
            )}

            {/* Notifications */}
            <NavLink to="/app/messages" className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
