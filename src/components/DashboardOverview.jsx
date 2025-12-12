import { useState, useEffect } from 'react'
import { ArrowLeft, CalendarRange, Download, Home, TrendingUp, TrendingDown, Loader2, AlertCircle, Phone, Clock, PlayCircle, Target, PhoneIncoming, PhoneOutgoing, Eye } from 'lucide-react'
import { getDashboardOverview, getDashboardMetrics, getCalls, getCampaigns } from '../api'
import StatusFilter from './StatusFilter'
import RecordingPlayer from './RecordingPlayer'

// Status filter options based on backend API
const statusFilterOptions = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'No Answer', value: 'NO_ANSWER' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

const DashboardOverview = ({ onBack, onHome, onCampaignClick }) => {
  const [range, setRange] = useState('total')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overviewData, setOverviewData] = useState(null)
  const [metricsData, setMetricsData] = useState(null)
  const [callsData, setCallsData] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  })
  const [callsPagination, setCallsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [campaignsData, setCampaignsData] = useState(null)
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignsPagination, setCampaignsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('') // Campaign status filter
  const [campaignTypeFilter, setCampaignTypeFilter] = useState('') // Campaign type filter

  const rangeLabels = ['total', 'weekly', 'monthly', 'custom']

  // Fetch dashboard data when range changes
  useEffect(() => {
    if (range !== 'custom' || (customDates.startDate && customDates.endDate)) {
      fetchDashboardData()
    }
  }, [range])

  // Fetch calls data separately when pagination or status filter changes
  useEffect(() => {
    if (!loading) {
      fetchCallsData()
    }
  }, [callsPagination.currentPage, statusFilter])

  // Fetch campaigns data on mount and when pagination or filters change
  useEffect(() => {
    fetchCampaignsData()
  }, [campaignsPagination.currentPage, campaignStatusFilter, campaignTypeFilter])

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

      // Fetch overview, metrics, and calls data in parallel
      const [overviewResponse, metricsResponse, callsResponse] = await Promise.all([
        getDashboardOverview(params).catch((err) => {
          console.warn('Failed to fetch overview data:', err.message)
          return null
        }),
        getDashboardMetrics(params).catch((err) => {
          console.warn('Failed to fetch metrics data:', err.message)
          return null
        }),
        getCalls({
          page: 1,
          limit: callsPagination.limit,
          ...(statusFilter ? { status: statusFilter } : {})
        }).catch((err) => {
          console.warn('Failed to fetch calls data:', err.message)
          return null
        })
      ])

      if (overviewResponse?.success && overviewResponse?.data) {
        setOverviewData(overviewResponse.data)
      }

      if (metricsResponse?.success && metricsResponse?.data) {
        setMetricsData(metricsResponse.data)
      }

      if (callsResponse) {
        setCallsData(callsResponse)
        setCallsPagination({
          currentPage: callsResponse.currentPage || 1,
          totalPages: callsResponse.totalPages || 1,
          totalRecords: callsResponse.totalRecords || 0,
          limit: callsResponse.limit || 20
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCallsData = async () => {
    try {
      const params = {
        page: callsPagination.currentPage,
        limit: callsPagination.limit
      }

      if (statusFilter) {
        params.status = statusFilter
      }

      const callsResponse = await getCalls(params)

      if (callsResponse) {
        setCallsData(callsResponse)
        setCallsPagination(prev => ({
          ...prev,
          currentPage: callsResponse.currentPage || prev.currentPage,
          totalPages: callsResponse.totalPages || 1,
          totalRecords: callsResponse.totalRecords || 0,
          limit: callsResponse.limit || 20
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch calls data:', err.message)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
      const exportBody = { range }

      if (range === 'custom' && customDates.startDate && customDates.endDate) {
        exportBody.startDate = customDates.startDate
        exportBody.endDate = customDates.endDate
      }

      // Use fetch directly to download the file
      const token = localStorage.getItem('authToken')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

      const response = await fetch(`${API_BASE_URL}/api/dashboard/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(exportBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Export failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-export-${range}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to export data')
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleRangeChange = (newRange) => {
    if (newRange === 'custom') {
      setShowDatePicker(true)
      setRange(newRange)
    } else {
      // Clear custom dates when switching to preset ranges
      setCustomDates({ startDate: '', endDate: '' })
      setShowDatePicker(false)
      setError('')
      setRange(newRange)
      // Reset to page 1 when changing range
      setCallsPagination(prev => ({ ...prev, currentPage: 1 }))
    }
  }

  const handleCustomDateSubmit = () => {
    if (customDates.startDate && customDates.endDate) {
      // Validate date range
      const start = new Date(customDates.startDate)
      const end = new Date(customDates.endDate)

      if (start > end) {
        setError('Start date must be before end date')
        return
      }

      setShowDatePicker(false)
      setError('')
      setCallsPagination(prev => ({ ...prev, currentPage: 1 }))
      fetchDashboardData()
    } else {
      setError('Please select both start and end dates')
    }
  }

  const handleCallsPageChange = (newPage) => {
    setCallsPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const fetchCampaignsData = async () => {
    setCampaignsLoading(true)
    try {
      const params = {
        page: campaignsPagination.currentPage,
        limit: campaignsPagination.limit
      }

      // Add status filter if selected
      if (campaignStatusFilter) {
        params.status = campaignStatusFilter
      }

      // Add type filter if selected
      if (campaignTypeFilter) {
        params.type = campaignTypeFilter
      }

      const response = await getCampaigns(params)

      if (response) {
        setCampaignsData(response)
        setCampaignsPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.currentPage || prev.currentPage,
          totalPages: response.pagination?.totalPages || 1,
          totalRecords: response.pagination?.totalRecords || 0,
          limit: response.pagination?.limit || 20
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch campaigns data:', err.message)
    } finally {
      setCampaignsLoading(false)
    }
  }

  const handleCampaignsPageChange = (newPage) => {
    setCampaignsPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleCampaignClick = (campaign) => {
    // Navigate to campaign details - this will be handled by parent component
    if (onCampaignClick) {
      onCampaignClick(campaign)
    }
  }

  // Helper functions
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get metrics from API response
  const getMetrics = () => {
    if (!overviewData?.metrics) return []

    const metrics = overviewData.metrics
    return [
      {
        label: 'Inbound Calls',
        value: metrics.inboundCalls?.value || '0',
        change: metrics.inboundCalls?.change || '',
        trend: metrics.inboundCalls?.trend || 'neutral'
      },
      {
        label: 'Inbound Minutes',
        value: metrics.inboundMinutes?.value || '0',
        change: metrics.inboundMinutes?.change || '',
        trend: metrics.inboundMinutes?.trend || 'neutral'
      },
      {
        label: 'Avg Call Time',
        value: metrics.avgCallTime?.value || '0:00',
        change: metrics.avgCallTime?.change || '',
        trend: metrics.avgCallTime?.trend || 'neutral'
      },
      {
        label: 'Total Spend',
        value: metrics.totalSpend?.value || '₹ 0',
        change: metrics.totalSpend?.change || '',
        trend: metrics.totalSpend?.trend || 'neutral'
      },
      {
        label: 'Positive Dispositions',
        value: metrics.positiveDispositions?.value || '0',
        change: metrics.positiveDispositions?.change || '',
        trend: metrics.positiveDispositions?.trend || 'neutral',
        percentage: metrics.positiveDispositions?.percentage
      },
      {
        label: 'Avg Cost Per Disposition',
        value: metrics.avgCostPerDisposition?.value || '₹ 0',
        change: metrics.avgCostPerDisposition?.change || '',
        trend: metrics.avgCostPerDisposition?.trend || 'neutral'
      }
    ]
  }

  const metrics = getMetrics()

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
                onClick={() => {
                  if (range !== 'custom') {
                    setRange('custom')
                    setShowDatePicker(true)
                  } else {
                    setShowDatePicker(!showDatePicker)
                  }
                }}
                className={`inline-flex items-center space-x-2 text-sm p-2 sm:px-4 rounded-lg transition-colors ${range === 'custom' && customDates.startDate && customDates.endDate
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'btn-secondary'
                  }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {range === 'custom' && customDates.startDate && customDates.endDate
                    ? `${new Date(customDates.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customDates.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Date Filter'}
                </span>
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
          <div className="card p-4 sm:p-6 border-2 border-primary-200 bg-primary-50/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">Select Custom Date Range</h3>
                <p className="text-xs text-secondary-500 mt-1">Choose a date range to view metrics for that period</p>
              </div>
              <CalendarRange className="w-5 h-5 text-primary-600" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={customDates.startDate}
                  onChange={(e) => {
                    setCustomDates({ ...customDates, startDate: e.target.value })
                    setError('')
                  }}
                  max={customDates.endDate || new Date().toISOString().split('T')[0]}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={customDates.endDate}
                  onChange={(e) => {
                    setCustomDates({ ...customDates, endDate: e.target.value })
                    setError('')
                  }}
                  min={customDates.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={handleCustomDateSubmit}
                disabled={!customDates.startDate || !customDates.endDate || loading}
                className="btn-primary disabled:opacity-50"
              >
                Apply Date Range
              </button>
              <button
                onClick={() => {
                  setShowDatePicker(false)
                  setError('')
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
            {customDates.startDate && customDates.endDate && (
              <p className="text-xs text-secondary-500 mt-2">
                Selected range: {new Date(customDates.startDate).toLocaleDateString()} to {new Date(customDates.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase text-secondary-500 tracking-wide">Time Range</p>
              <h2 className="text-lg font-semibold text-secondary-900">Select Time Period</h2>
              {overviewData?.dateRange && (
                <div className="mt-2">
                  <p className="text-xs text-secondary-500">
                    Data from <span className="font-medium text-secondary-700">{new Date(overviewData.dateRange.start).toLocaleDateString()}</span> to <span className="font-medium text-secondary-700">{new Date(overviewData.dateRange.end).toLocaleDateString()}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {rangeLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => handleRangeChange(label)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide disabled:opacity-50 transition-colors ${range === label
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200 hover:text-secondary-900'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="border border-secondary-200 rounded-xl px-4 py-5 bg-white hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-secondary-500 font-medium mb-1">{metric.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-secondary-900">
                        {metric.value}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ml-2 ${metric.trend === 'up'
                      ? 'bg-green-50'
                      : metric.trend === 'down'
                        ? 'bg-red-50'
                        : 'bg-secondary-50'
                      }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className={`w-5 h-5 ${metric.trend === 'up' ? 'text-green-600' : 'text-secondary-600'}`} />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-secondary-400" />
                      )}
                    </div>
                  </div>
                  {metric.change && (
                    <div className="flex items-center space-x-1 mt-3 pt-3 border-t border-secondary-100">
                      <span className={`text-xs font-semibold ${metric.trend === 'up'
                        ? 'text-green-600'
                        : metric.trend === 'down'
                          ? 'text-red-600'
                          : 'text-secondary-600'
                        }`}>
                        {metric.change}
                      </span>
                      {metric.percentage !== undefined && (
                        <span className="text-xs text-secondary-500">
                          ({metric.percentage}% positive)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Metrics Section */}
        {!loading && metricsData && (
          <div className="card p-4 sm:p-6">
            <div className="mb-6">
              <p className="text-xs uppercase text-secondary-500 tracking-wide">Detailed Analytics</p>
              <h2 className="text-lg font-semibold text-secondary-900">Dashboard Metrics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Call Statistics */}
              <div className="border border-secondary-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase text-secondary-500 tracking-wide">Call Statistics</p>
                    <h3 className="text-lg font-semibold text-secondary-900">Call Breakdown</h3>
                  </div>
                  <Target className="w-5 h-5 text-primary-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Total Calls</p>
                      <p className="text-xs text-secondary-400">All calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.calls?.total || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Inbound</p>
                      <p className="text-xs text-secondary-400">Inbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.calls?.inbound || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Outbound</p>
                      <p className="text-xs text-secondary-400">Outbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.calls?.outbound || 0}</p>
                  </div>
                </div>
              </div>

              {/* Call Status Distribution */}
              <div className="border border-secondary-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase text-secondary-500 tracking-wide">Performance</p>
                    <h3 className="text-lg font-semibold text-secondary-900">Call Status</h3>
                  </div>
                  <Target className="w-5 h-5 text-primary-600" />
                </div>
                <div className="space-y-3">
                  {metricsData.calls?.byStatus && Object.entries(metricsData.calls.byStatus).map(([status, count]) => {
                    const total = metricsData.calls.total || 1
                    const percentage = Math.round((count / total) * 100)
                    const statusLabels = {
                      completed: 'Completed',
                      noAnswer: 'No Answer',
                      busy: 'Busy',
                      failed: 'Failed'
                    }
                    const statusColors = {
                      completed: 'text-green-600',
                      noAnswer: 'text-orange-600',
                      busy: 'text-yellow-600',
                      failed: 'text-red-600'
                    }
                    return (
                      <div key={status} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                        <div>
                          <p className="text-sm text-secondary-600">{statusLabels[status] || status}</p>
                          <p className="text-xs text-secondary-400">{count} calls</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${statusColors[status] || 'text-secondary-900'}`}>{percentage}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Duration Statistics */}
              <div className="border border-secondary-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase text-secondary-500 tracking-wide">Duration</p>
                    <h3 className="text-lg font-semibold text-secondary-900">Call Duration</h3>
                  </div>
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Total Minutes</p>
                      <p className="text-xs text-secondary-400">All calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.duration?.totalMinutes || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Avg Duration</p>
                      <p className="text-xs text-secondary-400">Per call</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{formatDuration(metricsData.duration?.avgSeconds || 0)}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Inbound Minutes</p>
                      <p className="text-xs text-secondary-400">Inbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.duration?.byCallType?.inbound || 0}</p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Outbound Minutes</p>
                      <p className="text-xs text-secondary-400">Outbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{metricsData.duration?.byCallType?.outbound || 0}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border border-secondary-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase text-secondary-500 tracking-wide">Spend</p>
                    <h3 className="text-lg font-semibold text-secondary-900">Cost Breakdown</h3>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Total Cost</p>
                      <p className="text-xs text-secondary-400">All costs</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metricsData.costs?.total || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Inbound</p>
                      <p className="text-xs text-secondary-400">Inbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metricsData.costs?.inbound || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Outbound</p>
                      <p className="text-xs text-secondary-400">Outbound calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metricsData.costs?.outbound || 0}</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">AI Training</p>
                      <p className="text-xs text-secondary-400">Training costs</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metricsData.costs?.aiTraining || 0}</p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <p className="text-sm text-secondary-600">Infrastructure</p>
                      <p className="text-xs text-secondary-400">Infrastructure costs</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metricsData.costs?.infrastructure || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Calls Section */}
        {!loading && (
          <div className="card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-secondary-500 tracking-wide">Latest Activity</p>
                <h3 className="text-lg font-semibold text-secondary-900">Recent Calls</h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusFilter
                  options={statusFilterOptions}
                  selectedValue={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value)
                    setCallsPagination(prev => ({ ...prev, currentPage: 1 }))
                  }}
                  label="Filter by Status"
                  disabled={loading}
                  className="flex-shrink-0"
                />
                <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
              </div>
            </div>

            {callsData?.calls?.length > 0 ? (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {callsData.calls.map((call) => (
                    <div key={call._id} className="flex items-center justify-between border-b border-secondary-100 pb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${call.status === 'ANSWERED'
                            ? 'bg-green-100 text-green-800'
                            : call.status === 'BUSY'
                              ? 'bg-yellow-100 text-yellow-800'
                              : call.status === 'NO_ANSWER'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {call.status}
                          </span>
                          <span className="text-sm font-medium text-secondary-900">{call.cnum}</span>
                        </div>
                        <p className="text-xs text-secondary-500">
                          {formatDate(call.start)} • VMN: {call.vmn}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-xs text-secondary-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(call.duration)}</span>
                          </div>
                          <p className="text-xs text-secondary-500">Duration</p>
                        </div>
                        {call.recordingUrl && (
                          <div className="min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                            <RecordingPlayer recordingUrl={call.recordingUrl} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {callsPagination.totalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-secondary-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm font-medium text-secondary-700">
                        Showing <span className="font-bold text-primary-700">{((callsPagination.currentPage - 1) * callsPagination.limit) + 1}</span> to <span className="font-bold text-primary-700">{Math.min(callsPagination.currentPage * callsPagination.limit, callsPagination.totalRecords)}</span> of <span className="font-bold text-primary-700">{callsPagination.totalRecords}</span> calls
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCallsPageChange(callsPagination.currentPage - 1)}
                          disabled={callsPagination.currentPage === 1}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-secondary-600">
                          Page {callsPagination.currentPage} of {callsPagination.totalPages}
                        </span>
                        <button
                          onClick={() => handleCallsPageChange(callsPagination.currentPage + 1)}
                          disabled={callsPagination.currentPage >= callsPagination.totalPages}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-secondary-500 text-center py-8">No calls available</p>
            )}
          </div>
        )}

        {/* Campaigns Section */}
        {!loading && (
          <div className="card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase text-secondary-500 tracking-wide">Campaign Management</p>
                <h3 className="text-lg font-semibold text-secondary-900">All Campaigns</h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Campaign Type Filter */}
                <select
                  value={campaignTypeFilter}
                  onChange={(e) => {
                    setCampaignTypeFilter(e.target.value)
                    setCampaignsPagination(prev => ({ ...prev, currentPage: 1 }))
                  }}
                  className="input text-sm py-2 px-3 pr-8"
                  disabled={campaignsLoading}
                >
                  <option value="">All Types</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>

                {/* Campaign Status Filter */}
                <select
                  value={campaignStatusFilter}
                  onChange={(e) => {
                    setCampaignStatusFilter(e.target.value)
                    setCampaignsPagination(prev => ({ ...prev, currentPage: 1 }))
                  }}
                  className="input text-sm py-2 px-3 pr-8"
                  disabled={campaignsLoading}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>

                <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
              </div>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                <p className="ml-3 text-secondary-600">Loading campaigns...</p>
              </div>
            ) : campaignsData?.campaigns?.length > 0 ? (
              <>
                <div className="space-y-3">
                  {campaignsData.campaigns.map((campaign) => {
                    const isInbound = campaign.campaignType === 'inbound'
                    const metrics = campaign.metrics || {}
                    const successRate = metrics.totalCalls > 0
                      ? Math.round((metrics.successfulCalls / metrics.totalCalls) * 100)
                      : 0

                    return (
                      <div
                        key={campaign._id}
                        onClick={() => handleCampaignClick(campaign)}
                        className="flex items-center justify-between border border-secondary-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${isInbound ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {isInbound ? (
                                <PhoneIncoming className="w-4 h-4 text-green-600" />
                              ) : (
                                <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-semibold text-secondary-900 truncate">{campaign.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {campaign.status}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isInbound
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}>
                                  {isInbound ? 'Inbound' : 'Outbound'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-secondary-500">
                                <span className="truncate">{campaign.category}</span>
                                {campaign.tid && (
                                  <span>TID: {campaign.tid}</span>
                                )}
                                {campaign.startDate && campaign.endDate && (
                                  <span>
                                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                                  </span>
                                )}
                                {campaign.createdAt && (
                                  <span>Created: {formatDate(campaign.createdAt)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-secondary-600 ml-11 line-clamp-1">{campaign.description}</p>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-secondary-900">{metrics.totalCalls || 0}</div>
                            <p className="text-xs text-secondary-500">Total Calls</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">{successRate}%</div>
                            <p className="text-xs text-secondary-500">Success Rate</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCampaignClick(campaign)
                            }}
                            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-primary-600" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Campaigns Pagination Controls */}
                {campaignsPagination.totalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-secondary-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm font-medium text-secondary-700">
                        Showing <span className="font-bold text-primary-700">{((campaignsPagination.currentPage - 1) * campaignsPagination.limit) + 1}</span> to <span className="font-bold text-primary-700">{Math.min(campaignsPagination.currentPage * campaignsPagination.limit, campaignsPagination.totalRecords)}</span> of <span className="font-bold text-primary-700">{campaignsPagination.totalRecords}</span> campaigns
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCampaignsPageChange(campaignsPagination.currentPage - 1)}
                          disabled={campaignsPagination.currentPage === 1}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-secondary-600">
                          Page {campaignsPagination.currentPage} of {campaignsPagination.totalPages}
                        </span>
                        <button
                          onClick={() => handleCampaignsPageChange(campaignsPagination.currentPage + 1)}
                          disabled={campaignsPagination.currentPage >= campaignsPagination.totalPages}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-secondary-500 text-center py-8">No campaigns available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardOverview


