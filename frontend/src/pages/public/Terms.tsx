export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Overview</h2>
            <p>
              MedRevFlow provides cloud-based medical billing, practice management, and revenue cycle management software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Payment Processing</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-blue-900 font-medium italic">
                Our payment process is handled by our online reseller and Merchant of Record, Paddle.com. Paddle handles all customer service inquiries and returns related to payments.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">User Accounts & Compliance</h2>
            <p>
              Users are responsible for maintaining account security and ensuring entered data complies with applicable healthcare standards and privacy regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Subscription Tiers & Billing</h2>
            <p>
              Subscriptions auto-renew monthly or annually until canceled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Support Contact</h2>
            <p>
              User support inquiries regarding platform usage can be sent to <a href="mailto:abdulahadbutt420@gmail.com" className="text-blue-600 hover:underline">abdulahadbutt420@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Limitation of Liability</h2>
            <p>
              Our services are provided on an "as is" basis. While we target a 99.9% uptime, we do not guarantee uninterrupted access. MedRevFlow will not be held liable for indirect or consequential damages arising from the use of our software.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
