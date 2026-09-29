export function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the plan that best fits your practice's needs. All plans include a 14-day money-back guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Starter Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Starter</h2>
            <p className="text-slate-500 mb-6">Perfect for small practices getting started.</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">$99</span>
              <span className="text-slate-500">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Up to 3 Providers
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Basic claim scrubbing
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Standard support
            </li>
          </ul>
          <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors">
            Select Starter
          </button>
        </div>

        {/* Professional Plan */}
        <div className="bg-blue-600 rounded-2xl shadow-xl border border-blue-500 p-8 flex flex-col relative transform md:-translate-y-4 text-white">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="bg-blue-400 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">Most Popular</span>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Professional</h2>
            <p className="text-blue-100 mb-6">Advanced tools for growing practices.</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">$299</span>
              <span className="text-blue-200">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Up to 10 Providers
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Advanced claim rules
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Denial management workflow
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Priority support
            </li>
          </ul>
          <button className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-blue-600 font-semibold rounded-lg transition-colors shadow-sm">
            Select Professional
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h2>
            <p className="text-slate-500 mb-6">Custom solutions for large organizations.</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">Custom</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Unlimited Providers
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Custom API integrations
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Dedicated account manager
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              24/7 Phone support
            </li>
          </ul>
          <button className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
