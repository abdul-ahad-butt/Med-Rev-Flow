export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Handling</h2>
            <p>
              We practice standard HIPAA-conscious data isolation and encrypted storage practices for medical practice data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Payment Processing</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-blue-900 font-medium italic">
                We do not store credit card details on our servers. Payment processing and subscription management are safely handled by Paddle.com as our Merchant of Record.
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Security</h2>
            <p>
              We adhere to strict security standards, including TLS 1.3 encryption in transit and AES-256 encryption at rest, to protect your sensitive information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact Details</h2>
            <p>
              For privacy or data access requests, please contact us at <a href="mailto:abdulahadbutt420@gmail.com" className="text-blue-600 hover:underline">abdulahadbutt420@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
