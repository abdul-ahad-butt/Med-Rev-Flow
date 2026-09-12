import { useEffect, useState } from 'react'
import { DollarSign, Search, Filter, TrendingUp, AlertCircle, FileText } from 'lucide-react'
import api from '../api/client'
import { KPICard } from '../components/ui/KPICard'

export function RevenueCyclePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Revenue Cycle Management</h1>
          <p className="text-slate-500">Monitor practice financial health and claim lifecycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter by Date
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            Generate RCM Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total A/R" value="$1.2M" icon={<DollarSign className="w-5 h-5 text-blue-600" />} trend={{ value: 5.2, isPositive: false }} />
        <KPICard title="Days in A/R" value="38" icon={<TrendingUp className="w-5 h-5 text-yellow-600" />} trend={{ value: 2.1, isPositive: false }} />
        <KPICard title="Clean Claim Rate" value="94.5%" icon={<FileText className="w-5 h-5 text-green-600" />} trend={{ value: 1.2, isPositive: true }} />
        <KPICard title="Denial Rate" value="5.5%" icon={<AlertCircle className="w-5 h-5 text-red-600" />} trend={{ value: 0.8, isPositive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">A/R Aging Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">0-30 Days</span>
                <span className="font-medium text-slate-800">$650,000 (54%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">31-60 Days</span>
                <span className="font-medium text-slate-800">$320,000 (27%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '27%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">61-90 Days</span>
                <span className="font-medium text-slate-800">$150,000 (12%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">90+ Days</span>
                <span className="font-medium text-slate-800">$80,000 (7%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Top Denial Reasons</h3>
          <div className="space-y-4">
            {[
              { reason: 'Duplicate Claim', count: 145, amount: '$42,500' },
              { reason: 'Coverage Terminated', count: 98, amount: '$31,200' },
              { reason: 'Missing Information', count: 76, amount: '$18,400' },
              { reason: 'Prior Auth Required', count: 54, amount: '$26,800' }
            ].map((denial, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    {i+1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{denial.reason}</p>
                    <p className="text-xs text-slate-500">{denial.count} claims</p>
                  </div>
                </div>
                <div className="font-semibold text-slate-700">
                  {denial.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
