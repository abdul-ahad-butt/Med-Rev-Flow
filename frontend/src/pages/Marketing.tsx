import { useEffect, useState } from 'react'
import { Megaphone, Search, Filter, TrendingUp, Users, Activity, BarChart3, Globe } from 'lucide-react'
import api from '../api/client'
import { KPICard } from '../components/ui/KPICard'
import { SkeletonKPIs } from '../components/ui/Skeleton'

export function MarketingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/seo')
      setData(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Marketing & SEO</h1>
          <p className="text-slate-500">Track website performance, search rankings, and campaign metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonKPIs />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Website Visitors" value={data?.trafficCount || 0} icon={<Globe className="w-5 h-5 text-blue-600" />} trend={data?.trafficTrend || 0} />
            <KPICard title="Bounce Rate" value={`${data?.bounceRate || 0}%`} icon={<Activity className="w-5 h-5 text-orange-600" />} trend={data?.bounceTrend || 0} />
            <KPICard title="New Leads" value={data?.newLeads || 0} icon={<Users className="w-5 h-5 text-green-600" />} trend={data?.leadsTrend || 0} />
            <KPICard title="Conversion Rate" value={`${data?.conversionRate || 0}%`} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} trend={data?.conversionTrend || 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Active Campaigns</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {(!data?.campaigns || data.campaigns.length === 0) ? (
                  <div className="text-center text-slate-500 py-6">No active campaigns found.</div>
                ) : (
                  data.campaigns.map((c: any, i: number) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-slate-800">{c.name}</h4>
                          <p className="text-sm text-slate-500">{c.type} • {c.budget}</p>
                        </div>
                        <span className={`px-2 py-1 ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'} rounded text-xs font-medium`}>{c.status}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-3 pt-3 border-t border-slate-200">
                        <div><span className="text-slate-500">Clicks:</span> <span className="font-medium text-slate-700">{c.clicks}</span></div>
                        <div><span className="text-slate-500">Cost:</span> <span className="font-medium text-slate-700">{c.cost}</span></div>
                        <div><span className="text-slate-500">CPA:</span> <span className="font-medium text-slate-700">{c.cpa}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">SEO Keyword Rankings</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">Full Report</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-medium">Keyword</th>
                      <th className="pb-3 font-medium">Position</th>
                      <th className="pb-3 font-medium">Volume</th>
                      <th className="pb-3 font-medium text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!data?.keywords || data.keywords.length === 0) ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No keyword rankings available.</td></tr>
                    ) : (
                      data.keywords.map((kw: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3 font-medium text-slate-800">{kw.term}</td>
                          <td className="py-3 text-slate-600">{kw.position}</td>
                          <td className="py-3 text-slate-600">{kw.volume}</td>
                          <td className={`py-3 text-right ${kw.trend > 0 ? 'text-green-600' : kw.trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                            {kw.trend > 0 ? `+${kw.trend}` : kw.trend < 0 ? kw.trend : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
