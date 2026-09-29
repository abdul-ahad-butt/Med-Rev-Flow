export function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund and Cancellation Policy</h1>
        <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Subscription Cancellation</h2>
            <p>
              Users can cancel subscriptions anytime via practice settings or by emailing support at <a href="mailto:abdullah.butt420@gmail.com" className="text-blue-600 hover:underline">abdullah.butt420@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">14-Day Guarantee</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-4">
              <p className="text-blue-900 font-medium italic">
                We offer a 14-day money-back guarantee for initial subscription plans. To request a refund, contact us at abdullah.butt420@gmail.com or Paddle directly at paddle.net.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Prorated Charges</h2>
            <p>
              Mid-cycle cancellations do not issue partial refunds after the initial 14-day window unless required by law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
