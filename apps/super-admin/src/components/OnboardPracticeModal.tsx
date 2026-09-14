import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const schema = z.object({
  practiceName: z.string().min(2, 'Practice name is required'),
  taxId: z.string().optional(),
  npi: z.string().optional(),
  ownerFirstName: z.string().min(2, 'First name is required'),
  ownerLastName: z.string().min(2, 'Last name is required'),
  ownerEmail: z.string().email('Invalid email address'),
  ownerPhone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OnboardPracticeModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/practices', data);
      toast.success('Practice onboarded successfully');
      if (res.data.credentials) {
        setCredentials(res.data.credentials);
      } else {
        reset();
        onSuccess();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error || 'Failed to onboard practice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (credentials) {
      setCredentials(null);
      reset();
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {credentials ? 'Practice Onboarded' : 'Onboard New Practice'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {credentials ? 'Please securely share these credentials with the owner.' : 'Create a new tenant workspace and owner account.'}
            </p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {credentials ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Important: Save these credentials now</p>
                <p>The temporary password is only shown once and cannot be recovered. The user will be required to change it upon first login.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Owner Email</label>
                  <div className="mt-1 font-mono text-sm font-medium text-slate-900">{credentials.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Temporary Password</label>
                  <div className="mt-1 font-mono text-lg font-medium text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded">
                    {credentials.temporaryPassword}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form id="onboard-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Practice Details */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <Building2 className="w-5 h-5" />
                  <h3 className="font-semibold">Practice Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Practice Name *</label>
                    <input
                      {...register('practiceName')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. City General Hospital"
                    />
                    {errors.practiceName && <p className="text-xs text-red-600 mt-1">{errors.practiceName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID</label>
                    <input
                      {...register('taxId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NPI</label>
                    <input
                      {...register('npi')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold">Owner Account</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  This user will be created as the Practice Owner with full administrative access to their workspace.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                    <input
                      {...register('ownerFirstName')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.ownerFirstName && <p className="text-xs text-red-600 mt-1">{errors.ownerFirstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                    <input
                      {...register('ownerLastName')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.ownerLastName && <p className="text-xs text-red-600 mt-1">{errors.ownerLastName.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      {...register('ownerEmail')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.ownerEmail && <p className="text-xs text-red-600 mt-1">{errors.ownerEmail.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      {...register('ownerPhone')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          {credentials ? (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="onboard-form"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Onboard Practice'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
