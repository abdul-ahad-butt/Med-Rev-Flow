import { useEffect, useState } from 'react'
import { BarChart3, PieChart, TrendingUp, Users, Activity, Download, Filter, Calendar } from 'lucide-react'
import api from '../api/client'
import { SkeletonKPIs } from '../components/ui/Skeleton'
import { KPICard } from '../components/ui/KPICard'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const tabs = [
    { id: 'revenue', name: 'Revenue Cycle', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'claims', name: 'Claims Analysis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'denials', name: 'Denials Management', icon: <Activity className="w-4 h-4" /> },
    { id: 'providers', name: 'Provider Performance', icon: <Users className="w-4 h-4" /> },
    { id: 'acquisition', name: 'Patient Acquisition', icon: <PieChart className="w-4 h-4" /> }
  ]

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      let endpoint = ''
      switch (activeTab) {
        case 'revenue': endpoint = '/reports/revenue-cycle'; break;
        case 'claims': endpoint = '/reports/claims'; break;
        case 'denials': endpoint = '/reports/denials'; break;
        case 'providers': endpoint = '/reports/providers'; break;
        case 'acquisition': endpoint = '/reports/acquisition'; break;
      }
      
      if (endpoint) {
        const res = await api.get(endpoint)
        setData(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch report data', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
  }

  const renderContent = () => {
    if (loading) return <div className="mt-6"><SkeletonKPIs /></div>
    if (!data) return <div className="mt-6 text-slate-500">No data available</div>

    switch (activeTab) {
      case 'revenue':
        return (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Gross Charges" value={formatCurrency(data.grossCharges)} icon={<TrendingUp className="w-5 h-5 text-blue-600" />} trend={{ value: 12, isPositive: true }} />
              <KPICard title="Total Payments" value={formatCurrency(data.payments)} icon={<Activity className="w-5 h-5 text-green-600" />} trend={{ value: 8, isPositive: true }} />
              <KPICard title="Adjustments" value={formatCurrency(data.adjustments)} icon={<PieChart className="w-5 h-5 text-purple-600" />} />
              <KPICard title="Outstanding A/R" value={formatCurrency(data.outstandingAR)} icon={<BarChart3 className="w-5 h-5 text-orange-600" />} trend={{ value: 5, isPositive: false }} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Net Collection Rate</span>
                    <span className="text-xl font-bold text-slate-800">{data.collectionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Claim Denial Rate</span>
                    <span className="text-xl font-bold text-slate-800">{data.denialRate}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Claim Funnel</h3>
                <div className="space-y-3">
                  {Object.entries(data.funnel || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="capitalize text-slate-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-semibold text-slate-800">{val} claims</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'providers':
        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Appointments</th>
                  <th className="px-6 py-4">Claims</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Denial Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.firstName} {p.lastName} {p.credentials && `, ${p.credentials}`}</td>
                    <td className="px-6 py-4 text-slate-600">{p.appointments}</td>
                    <td className="px-6 py-4 text-slate-600">{p.claims}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{formatCurrency(p.revenue)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${p.denialRate > 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {p.denialRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return (
          <div className="mt-6 bg-white p-12 rounded-xl border border-slate-200 text-center">
            <h3 className="text-lg font-medium text-slate-800 mb-2">Detailed view coming soon</h3>
            <p className="text-slate-500">This report view is currently being enhanced with advanced visualizations.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">Comprehensive insights into practice performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  )
}
