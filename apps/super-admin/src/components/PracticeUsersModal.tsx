import { useState, useEffect } from 'react';
import { Shield, Key, AlertCircle, Users } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface PracticeUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId: string | null;
  practiceName: string;
}

export function PracticeUsersModal({ isOpen, onClose, practiceId, practiceName }: PracticeUsersModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);

  useEffect(() => {
    if (isOpen && practiceId) {
      fetchPracticeDetails();
      setNewCredentials(null);
    }
  }, [isOpen, practiceId]);

  const fetchPracticeDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/practices/${practiceId}`);
      setUsers(res.data.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      setNewCredentials(res.data.credentials);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Practice Staff</h2>
              <p className="text-sm text-slate-500 mt-0.5">{practiceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {newCredentials && (
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important: Save these credentials</p>
                  <p>This temporary password is only shown once. The user will be forced to change it upon first login.</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 font-mono text-sm flex justify-between items-center">
                <div>
                  <span className="text-slate-500">Email:</span> <br />
                  <span className="font-semibold text-slate-800">{newCredentials.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Temp Password:</span> <br />
                  <span className="font-semibold text-slate-800 tracking-wider text-base">
                    {newCredentials.temporaryPassword}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setNewCredentials(null)}
                  className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 font-medium text-slate-700 rounded-lg transition-colors"
                >
                  Clear Password View
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No users found for this practice.</div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">User</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Role</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Last Login</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                          <Shield className="w-3.5 h-3.5" />
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${
                            user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 shadow-sm"
                        >
                          <Key className="w-3.5 h-3.5" /> Reset PW
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
