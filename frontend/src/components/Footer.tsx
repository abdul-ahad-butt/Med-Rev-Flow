import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MedRevFlow</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-sm">
              The complete revenue cycle management platform for small and mid-size medical practices.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center">
          <p>
            © 2026 MedRevFlow. Payments processed securely by Paddle.com, Merchant of Record. Support contact: <a href="mailto:abdulahadbutt420@gmail.com" className="text-blue-400 hover:underline">abdulahadbutt420@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
