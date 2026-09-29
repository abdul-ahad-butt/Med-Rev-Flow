import { useState } from 'react';
import toast from 'react-hot-toast';

export function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Your message has been sent successfully. We will get back to you soon!');
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Contact Us & Customer Support</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We're here to help. Reach out to us for any inquiries or support requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-2xl p-8 h-full">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Support Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Support Email</h3>
                <a href="mailto:abdullah.butt420@gmail.com" className="text-blue-600 hover:underline font-medium">
                  abdullah.butt420@gmail.com
                </a>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Support Hours</h3>
                <p className="text-slate-700 font-medium">Monday – Friday<br/>9:00 AM – 6:00 PM EST</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Response Time</h3>
                <p className="text-slate-700 font-medium">24-48 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  id="category"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
