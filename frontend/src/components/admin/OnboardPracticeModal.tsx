import { useState } from 'react';
import { X, Building2, Mail, Phone, MapPin, User } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface OnboardPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OnboardPracticeModal({ isOpen, onClose, onSuccess }: OnboardPracticeModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Practice
      const practiceRes = await api.post('/admin/practices', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        status: 'ACTIVE'
      });

      const practiceId = practiceRes.data.data.id;

      // 2. Create Owner
      const ownerRes = await api.post('/admin/practice-owners', {
        practiceId,
        firstName: formData.ownerFirstName,
        lastName: formData.ownerLastName,
        email: formData.ownerEmail,
      });

      setCredentials(ownerRes.data.credentials);
      setStep(2);
      onSuccess();
      toast.success('Practice and owner created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to onboard practice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Onboard New Practice
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <form id="onboard-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Practice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Practice Name *</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Memorial Healthcare" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">General Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="info@practice.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="(555) 123-4567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="123 Medical Blvd" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="City" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="State" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                      <input type="text" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zip" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Practice Owner (Primary Admin)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                    <input required type="text" value={formData.ownerFirstName} onChange={(e) => setFormData({...formData, ownerFirstName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                    <input required type="text" value={formData.ownerLastName} onChange={(e) => setFormData({...formData, ownerLastName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner Email (Used for login) *</label>
                    <input required type="email" value={formData.ownerEmail} onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="owner@practice.com" />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Practice Onboarded!</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                The practice and owner account have been created successfully. Provide the following temporary credentials to the owner securely.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-sm mx-auto text-left">
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Login Email</label>
                  <div className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {credentials?.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temporary Password</label>
                  <div className="font-mono text-lg font-bold text-slate-900 bg-white border border-slate-200 rounded px-3 py-2 mt-1 select-all">
                    {credentials?.temporaryPassword}
                  </div>
                  <p className="text-xs text-red-500 mt-2">
                    Please copy this password now. It will not be shown again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          {step === 1 ? (
            <>
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="onboard-form" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {loading ? 'Creating...' : 'Create Practice'}
              </button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
