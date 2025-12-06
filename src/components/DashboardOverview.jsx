import { useState, useEffect } from 'react'
import { ArrowLeft, CalendarRange, Download, Home, Target, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { getDashboardOverview, getDashboardMetrics, downloadDashboardExport } from '../api'

const DashboardOverview = ({ onBack, onHome }) => {
  const [range, setRange] = useState('total')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overviewData, setOverviewData] = useState(null)
  const [metricsData, setMetricsData] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  })

  const rangeLabels = ['total', 'weekly', 'monthly', 'custom']

  // Fetch dashboard data when range changes
  useEffect(() => {
    fetchDashboardData()
  }, [range])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = { range }
      
      // Add custom date range if selected
      if (range === 'custom' && customDates.startDate && customDates.endDate) {
        params.startDate = customDates.startDate
        params.endDate = customDates.endDate
      }
      
      // Fetch both overview and detailed metrics
      const [overview, metrics] = await Promise.all([
        getDashboardOverview(params),
        getDashboardMetrics(params)
      ])
      
      setOverviewData(overview)
      setMetricsData(metrics)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportParams = { range }
      
      if (range === 'custom' && customDates.startDate && customDates.endDate) {
        exportParams.startDate = customDates.startDate
        exportParams.endDate = customDates.endDate
      }
      
      const filename = `dashboard-${range}-${new Date().toISOString().split('T')[0]}.xlsx`
      await downloadDashboardExport(exportParams, filename)
    } catch (err) {
      setError(err.message || 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleRangeChange = (newRange) => {
    setRange(newRange)
    if (newRange === 'custom') {
      setShowDatePicker(true)
    }
  }

  const handleCustomDateSubmit = () => {
    if (customDates.startDate && customDates.endDate) {
      setShowDatePicker(false)
      fetchDashboardData()
    }
  }

  // Format metrics for display
  const getFormattedMetrics = () => {
    if (!overviewData) return []
    
    return [
      { 
        label: 'Total Calls', 
        value: overviewData.totalCalls?.toLocaleString() || '0'
      },
      { 
        label: 'Total Minutes', 
        value: overviewData.totalMinutes?.toLocaleString() || '0'
      },
      { 
        label: 'Avg Call Time', 
        value: overviewData.avgCallDuration || '0:00'
      },
      { 
        label: 'Total Spend', 
        value: overviewData.totalSpend ? `₹ ${overviewData.totalSpend.toLocaleString()}` : '₹ 0'
      },
      { 
        label: 'Successful Calls', 
        value: overviewData.successfulCalls?.toLocaleString() || '0'
      },
      { 
        label: 'Success Rate', 
        value: overviewData.successRate ? `${overviewData.successRate}%` : '0%'
      }
    ]
  }

  const metrics = getFormattedMetrics()

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
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="btn-secondary inline-flex items-center space-x-2 text-sm p-2 sm:px-4"
              >
                <CalendarRange className="w-4 h-4" />
                <span className="hidden sm:inline">Date Filter</span>
              </button>
              <button 
                onClick={handleExport}
                disabled={exporting || loading}
                className="btn-primary inline-flex items-center space-x-2 text-sm p-2 sm:px-4 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export Report'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading dashboard</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Date Picker */}
        {showDatePicker && range === 'custom' && (
          <div className="card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Select Custom Date Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customDates.startDate}
                  onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customDates.endDate}
                  onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button 
                onClick={handleCustomDateSubmit}
                disabled={!customDates.startDate || !customDates.endDate}
                className="btn-primary disabled:opacity-50"
              >
                Apply Date Range
              </button>
              <button 
                onClick={() => setShowDatePicker(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                  onClick={() => handleRangeChange(label)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide disabled:opacity-50 ${
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="ml-3 text-secondary-600">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="border border-secondary-200 rounded-xl px-3 sm:px-4 py-4 sm:py-5 bg-white flex items-center justify-between hover:border-primary-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-secondary-500 break-words">{metric.label}</p>
                    <p className="text-xl sm:text-2xl font-semibold text-secondary-900 mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className="bg-secondary-50 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && metricsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-secondary-500 tracking-wide">Performance Snapshot</p>
                  <h3 className="text-lg font-semibold text-secondary-900">Call Status Distribution</h3>
                </div>
                <Target className="w-5 h-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                {metricsData.callStatusBreakdown?.map((row) => (
                  <div key={row.status} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">{row.status}</p>
                      <p className="text-xs text-secondary-400">{row.count} calls</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-secondary-900">{row.percentage}%</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-secondary-500 text-center py-4">No data available</p>
                )}
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-secondary-500 tracking-wide">Spend Monitoring</p>
                  <h3 className="text-lg font-semibold text-secondary-900">Cost Breakdown</h3>
                </div>
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                {metricsData.costBreakdown?.map((row) => (
                  <div key={row.category} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">{row.category}</p>
                      <p className="text-xs text-secondary-400">Share of total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-secondary-900">
                        ₹ {row.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-primary-600 font-semibold">{row.percentage}%</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-secondary-500 text-center py-4">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardOverview


