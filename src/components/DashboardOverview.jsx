import { useState } from 'react'
import { ArrowLeft, CalendarRange, Download, Home, Target, TrendingUp } from 'lucide-react'

const DashboardOverview = ({ onBack, onHome }) => {
  const [range, setRange] = useState('total')

  const rangeLabels = ['total', 'weekly', 'monthly', 'custom']

  const metrics = [
    { label: 'Inbound Calls', value: { total: '4,215', weekly: '980', monthly: '3,450', custom: '—' } },
    { label: 'Inbound Minutes', value: { total: '11,420', weekly: '2,610', monthly: '8,420', custom: '—' } },
    { label: 'Avg Call Time', value: { total: '03:05', weekly: '03:18', monthly: '03:10', custom: '—' } },
    { label: 'Total Spend', value: { total: '₹ 2,48,900', weekly: '₹ 58,500', monthly: '₹ 1,98,200', custom: '—' } },
    { label: 'Positive Dispositions', value: { total: '2,890', weekly: '640', monthly: '2,050', custom: '—' } },
    { label: 'Avg AI Cost per Positive Disposition', value: { total: '₹ 86', weekly: '₹ 92', monthly: '₹ 82', custom: '—' } }
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0 touch-manipulation"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0 touch-manipulation"
                aria-label="Home"
              >
                <Home className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-secondary-500 hidden sm:block">Section</p>
                <h1 className="text-lg sm:text-xl font-semibold text-secondary-900">Dashboard Overview</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button className="btn-secondary inline-flex items-center space-x-2 text-sm p-2 sm:px-4">
                <CalendarRange className="w-4 h-4" />
                <span className="hidden sm:inline">Date Filter</span>
              </button>
              <button className="btn-primary inline-flex items-center space-x-2 text-sm p-2 sm:px-4">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase text-secondary-500 tracking-wide">Time Range</p>
              <h2 className="text-lg font-semibold text-secondary-900">Choose a preset view</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {rangeLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => setRange(label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    range === label
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-secondary-100 text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="border border-secondary-200 rounded-xl px-3 sm:px-4 py-4 sm:py-5 bg-white flex items-center justify-between hover:border-primary-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-secondary-500 break-words">{metric.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold text-secondary-900 mt-1">
                    {metric.value[range]}
                  </p>
                  <p className="text-xs text-secondary-400 mt-1 hidden sm:block">Total / Weekly / Monthly / Specific dates</p>
                </div>
                <div className="bg-secondary-50 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-secondary-500 tracking-wide">Performance Snapshot</p>
                <h3 className="text-lg font-semibold text-secondary-900">Disposition Trends</h3>
              </div>
              <Target className="w-5 h-5 text-primary-600" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Positive Dispositions', value: '62%', trend: '+4.1%' },
                { label: 'Neutral Dispositions', value: '21%', trend: '-1.8%' },
                { label: 'Negative / DND', value: '17%', trend: '-0.6%' }
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                  <div>
                    <p className="text-sm text-secondary-600">{row.label}</p>
                    <p className="text-xs text-secondary-400">Week over week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-secondary-900">{row.value}</p>
                    <p className="text-xs text-primary-600 font-semibold">{row.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-secondary-500 tracking-wide">Spend Monitoring</p>
                <h3 className="text-lg font-semibold text-secondary-900">Cost Allocation</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Inbound Minutes', amount: '₹ 1,02,400', share: '41%' },
                { label: 'Outbound Minutes', amount: '₹ 88,500', share: '35%' },
                { label: 'AI Training / GPT Usage', amount: '₹ 33,250', share: '13%' },
                { label: 'Infra & DIDs', amount: '₹ 24,750', share: '11%' }
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                  <div>
                    <p className="text-sm text-secondary-600">{row.label}</p>
                    <p className="text-xs text-secondary-400">Share of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-secondary-900">{row.amount}</p>
                    <p className="text-xs text-primary-600 font-semibold">{row.share}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview


