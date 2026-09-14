import { useState, useEffect } from 'react';
import { Building2, Plus, Search, MoreVertical } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { OnboardPracticeModal } from '../components/OnboardPracticeModal';

const PracticeActions = ({ practice, onRefresh }: { practice: Practice, onRefresh: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleStatus = async () => {
    try {
      if (practice.status === 'ACTIVE') {
        if (!window.confirm('Suspend this practice? Users will not be able to log in.')) return;
        await api.post(`/admin/practices/${practice.id}/suspend`);
        toast.success('Practice suspended');
      } else {
        await api.post(`/admin/practices/${practice.id}/activate`);
        toast.success('Practice activated');
      }
      onRefresh();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 focus:outline-none">
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20 overflow-hidden">
            <button
              onClick={toggleStatus}
              className={`w-full text-left px-4 py-2 text-sm font-medium ${practice.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
            >
              {practice.status === 'ACTIVE' ? 'Suspend Practice' : 'Activate Practice'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface Practice {
  id: string;
  name: string;
  taxId: string | null;
  npi: string | null;
  status: string;
  createdAt: string;
}

export function PracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPractices = async () => {
    try {
      const res = await api.get('/admin/practices');
      setPractices(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load practices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, []);

  const filteredPractices = practices.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Practices</h1>
          <p className="text-slate-500 mt-1">Manage tenant practices across the platform.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Onboard Practice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search practices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NPI</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading practices...
                  </td>
                </tr>
              ) : filteredPractices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No practices found.
                  </td>
                </tr>
              ) : (
                filteredPractices.map((practice) => (
                  <tr key={practice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">{practice.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {practice.taxId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {practice.npi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${practice.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {practice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(practice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <PracticeActions practice={practice} onRefresh={fetchPractices} />
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
          setIsModalOpen(false);
          fetchPractices();
        }}
      />
    </div>
  );
}
