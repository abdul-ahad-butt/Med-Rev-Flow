import { useState, useEffect } from 'react';
import { Building2, Users, Activity, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPractices: 0,
    activePractices: 0,
    suspendedPractices: 0,
    totalUsers: 0,
    newPracticesThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data?.stats) {
          setStats(response.data.stats);
        }
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading platform data...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of system health and tenant usage</p>
        </div>
        <button 
          onClick={() => navigate('/admin/practices?new=true')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Onboard New Practice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Practices</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalPractices}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">+{stats.newPracticesThisMonth} this month</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Practices</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activePractices}</p>
            <p className="text-xs text-slate-500 mt-1">Healthy tenants</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Platform Users</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
            <p className="text-xs text-slate-500 mt-1">Across all tenants</p>
          </div>
        </div>
      </div>

      {/* Placeholder for more widgets like recent activity or onboarding graph */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/practices')}
            className="text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="font-medium text-slate-900">Manage Practices</div>
            <div className="text-sm text-slate-500 mt-1">View, edit, or suspend tenant access.</div>
          </button>
          <button 
            onClick={() => navigate('/admin/audit-log')}
            className="text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="font-medium text-slate-900">System Audit Log</div>
            <div className="text-sm text-slate-500 mt-1">Review critical security events and logins.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
