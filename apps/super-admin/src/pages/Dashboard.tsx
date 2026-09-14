import { useState, useEffect } from 'react';
import { Building2, Users, Activity, TrendingUp } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalPractices: 0,
    totalUsers: 0,
    systemHealth: '100%',
    activeSessions: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        const data = res.data;
        
        setStats({
          totalPractices: data.stats.totalPractices,
          totalUsers: data.stats.totalUsers,
          systemHealth: data.stats.totalPractices > 0 ? `${Math.round((data.stats.activePractices / data.stats.totalPractices) * 100)}%` : '100%',
          activeSessions: data.stats.activeSessions, 
        });
        
        if (data.recentActivity) {
          setRecentActivity(data.recentActivity);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Monitor all tenant practices and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Practices', value: stats.totalPractices, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'System Uptime', value: stats.systemHealth, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{loading ? '...' : stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500">Latest actions across all tenant practices.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading activity...</td>
                </tr>
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No recent activity found.</td>
                </tr>
              ) : (
                recentActivity.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
