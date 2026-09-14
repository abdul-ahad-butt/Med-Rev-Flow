import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus, Search, MoreVertical, ShieldAlert } from 'lucide-react';
import { OnboardPracticeModal } from '../../components/admin/OnboardPracticeModal';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Practice {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  _count: {
    users: number;
    patients: number;
  };
}

export function PracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === 'true');

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const fetchPractices = async () => {
    try {
      const response = await api.get(`/admin/practices?search=${search}`);
      setPractices(response.data.data);
    } catch (error) {
      toast.error('Failed to load practices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Practices</h1>
          <p className="text-slate-500 text-sm mt-1">Onboard and manage tenant practices and their owners</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-4 h-4" />
          New Practice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search practices by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Practice Name</th>
                <th className="px-6 py-4 font-medium">Contact Email</th>
                <th className="px-6 py-4 font-medium">Users</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading practices...
                  </td>
                </tr>
              ) : practices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-300 mb-2" />
                      <p>No practices found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                practices.map((practice) => (
                  <tr key={practice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{practice.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: {practice.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{practice.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{practice._count.users}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        practice.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' 
                          : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                      }`}>
                        {practice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-blue-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OnboardPracticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPractices();
        }}
      />
    </div>
  );
}
