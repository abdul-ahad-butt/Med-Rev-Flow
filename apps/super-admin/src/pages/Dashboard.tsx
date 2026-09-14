import { useState, useEffect } from 'react';
import { Building2, Users, Activity, TrendingUp } from 'lucide-react';
import api from '../api/client';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalPractices: 0,
    totalUsers: 0,
    systemHealth: '100%',
    activeSessions: 0,
  });

  useEffect(() => {
    // In a real app, this would be an API call to /api/admin/dashboard
    // For now, we simulate the data
    setStats({
      totalPractices: 1,
      totalUsers: 5,
      systemHealth: '99.9%',
      activeSessions: 12,
    });
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
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>
      
      {/* Placeholder for more global charts/tables */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center h-64 text-slate-400">
        <Activity className="w-12 h-12 mb-4 text-slate-300" />
        <p>Detailed analytics coming soon</p>
      </div>
    </div>
  );
}
