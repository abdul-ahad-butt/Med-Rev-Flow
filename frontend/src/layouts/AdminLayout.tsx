import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, Users, LayoutDashboard, LogOut, Search, Menu, X, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getInitials } from '../utils/cn';
import api from '../api/client';
import toast from 'react-hot-toast';

const ADMIN_NAV_ITEMS = [
  { key: 'admin-dashboard', label: 'Platform Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { key: 'admin-practices', label: 'Practices', icon: Building2, path: '/admin/practices' },
  { key: 'admin-users', label: 'Platform Users', icon: Users, path: '/admin/users' },
  { key: 'admin-audit', label: 'System Audit Log', icon: ShieldAlert, path: '/admin/audit' },
];

export function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center text-red-600 font-medium">Access Denied</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 text-slate-300`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 flex-shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Super Admin</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
                ${!sidebarOpen ? 'justify-center px-2' : ''}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${!sidebarOpen ? 'mx-auto' : ''}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user ? getInitials(user.firstName, user.lastName) : 'SA'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${!sidebarOpen ? 'justify-center px-2' : ''}`}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1"></div>
          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            Platform Management Portal
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
