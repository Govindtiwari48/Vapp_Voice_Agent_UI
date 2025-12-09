import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, CalendarRange, Download, Home, Target, TrendingUp, Loader2, AlertCircle, Phone, Clock, PlayCircle } from 'lucide-react'
import { getDashboardOverview, getDashboardMetrics, downloadDashboardExport, getCalls, getAnalyticsSummary } from '../api'
import StatusFilter from './StatusFilter'

// Status filter options based on backend API
const statusFilterOptions = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'No Answer', value: 'NO ANSWER' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

const DashboardOverview = ({ onBack, onHome }) => {
  const [range, setRange] = useState('total')
  const [statusFilter, setStatusFilter] = useState('') // Empty string means "All"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [overviewData, setOverviewData] = useState(null)
  const [metricsData, setMetricsData] = useState(null)
  const [callsData, setCallsData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
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
  const isRangeChanging = useRef(false)

  const rangeLabels = ['total', 'weekly', 'monthly', 'custom']

  // Helper functions for call data
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const fetchCallsData = async () => {
    try {
      const params = {
        page: callsPagination.currentPage,
        limit: callsPagination.limit
      }

      // Add status filter if selected
      if (statusFilter) {
        params.status = statusFilter
      }

      const calls = await getCalls(params)

      if (calls) {
        const totalRecords = calls.totalRecords || 0
        const limit = calls.limit || 20
        let totalPages = calls.totalPages || 1
        if (totalRecords > 0 && limit > 0) {
          const calculatedPages = Math.ceil(totalRecords / limit)
          if (!calls.totalPages || calculatedPages > totalPages) {
            totalPages = calculatedPages
          }
        }

        setCallsData(calls)
        setCallsPagination(prev => ({
          currentPage: calls.currentPage || prev.currentPage,
          totalPages: totalPages,
          totalRecords: totalRecords,
          limit: limit
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch calls data:', err.message)
    }
  }

  // Fetch dashboard data when range or status filter changes
  useEffect(() => {
    isRangeChanging.current = true
    setCallsPagination(prev => ({ ...prev, currentPage: 1 }))
    fetchDashboardData()
  }, [range, statusFilter])

  // Fetch calls when pagination changes (but not when range is changing)
  useEffect(() => {
    // Skip if we're changing range (calls will be fetched in fetchDashboardData)
    if (isRangeChanging.current) {
      isRangeChanging.current = false
      return
    }
    // Only fetch if we're not in the initial loading state and page is valid
    if (!loading && callsPagination.currentPage > 0) {
      fetchCallsData()
    }
  }, [callsPagination.currentPage])

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

      // Fetch overview, metrics, calls, and analytics data
      const [overview, metrics, calls, analytics] = await Promise.all([
        getDashboardOverview(params).catch((err) => {
          console.warn('Failed to fetch overview data:', err.message)
          return null
        }),
        getDashboardMetrics(params).catch((err) => {
          console.warn('Failed to fetch metrics data:', err.message)
          return null
        }),
        getCalls({
          page: callsPagination.currentPage,
          limit: callsPagination.limit,
          ...(statusFilter ? { status: statusFilter } : {})
        }).catch((err) => {
          console.warn('Failed to fetch calls data:', err.message)
          return null
        }),
        getAnalyticsSummary().catch((err) => {
          console.warn('Failed to fetch analytics data:', err.message)
          return null
        })
      ])

      setOverviewData(overview)
      setMetricsData(metrics)

      // Update calls data and pagination
      if (calls) {
        const totalRecords = calls.totalRecords || 0
        const limit = calls.limit || 20
        let totalPages = calls.totalPages || 1
        if (totalRecords > 0 && limit > 0) {
          const calculatedPages = Math.ceil(totalRecords / limit)
          if (!calls.totalPages || calculatedPages > totalPages) {
            totalPages = calculatedPages
          }
        }

        setCallsData(calls)
        setCallsPagination({
          currentPage: calls.currentPage || 1,
          totalPages: totalPages,
          totalRecords: totalRecords,
          limit: limit
        })
      } else {
        setCallsData(null)
      }

      setAnalyticsData(analytics)
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
      setCallsPagination(prev => ({ ...prev, currentPage: 1 }))
      fetchDashboardData()
    }
  }

  const handleCallsPageChange = (newPage) => {
    setCallsPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  // Helper function to format call duration from seconds to mm:ss
  const formatAvgCallTime = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format metrics for display - prioritize analytics data
  const getFormattedMetrics = () => {
    const dataSource = analyticsData || overviewData
    if (!dataSource) return []

    return [
      {
        label: 'Total Calls',
        value: dataSource.totalCalls?.toLocaleString() || '0'
      },
      {
        label: 'Total Minutes',
        value: dataSource.totalMinutes?.toLocaleString() || '0'
      },
      {
        label: 'Avg Call Time',
        value: analyticsData ? formatAvgCallTime(analyticsData.avgCallTime) : (dataSource.avgCallDuration || '0:00')
      },
      {
        label: 'Total Spend',
        value: dataSource.totalSpend ? `₹ ${parseFloat(dataSource.totalSpend).toLocaleString()}` : '₹ 0'
      },
      {
        label: 'Successful Calls',
        value: dataSource.successfulCalls?.toLocaleString() || '0'
      },
      {
        label: 'Success Rate',
        value: dataSource.successRate ? `${dataSource.successRate}%` : '0%'
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
              {analyticsData?.dateRange && (
                <div className="mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Analytics Data
                  </span>
                  <p className="text-xs text-secondary-500">
                    Data from {new Date(analyticsData.dateRange.start).toLocaleDateString()} to {new Date(analyticsData.dateRange.end).toLocaleDateString()}
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide disabled:opacity-50 ${range === label
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

            {/* Recent Calls Section */}
            <div className="card p-5 space-y-4 lg:col-span-2">
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
                            <button
                              onClick={() => window.open(call.recordingUrl, '_blank')}
                              className="p-1 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Play Recording"
                            >
                              <PlayCircle className="w-4 h-4 text-primary-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {(callsPagination.totalPages > 1 || callsPagination.totalRecords > callsPagination.limit) && (
                    <div className="pt-4 mt-4 border-t border-secondary-200 bg-primary-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm sm:text-base font-medium text-secondary-700">
                          Showing <span className="font-bold text-primary-700">{((callsPagination.currentPage - 1) * callsPagination.limit) + 1}</span> to <span className="font-bold text-primary-700">{Math.min(callsPagination.currentPage * callsPagination.limit, callsPagination.totalRecords)}</span> of <span className="font-bold text-primary-700">{callsPagination.totalRecords}</span> total calls
                          {callsPagination.totalPages > 1 && (
                            <span className="text-secondary-600 ml-2">(Page {callsPagination.currentPage} of {callsPagination.totalPages})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCallsPageChange(1)}
                            disabled={callsPagination.currentPage === 1}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="First page"
                          >
                            First
                          </button>
                          <button
                            onClick={() => handleCallsPageChange(callsPagination.currentPage - 1)}
                            disabled={callsPagination.currentPage === 1}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Previous page"
                          >
                            Previous
                          </button>

                          {/* Page Number Buttons */}
                          {callsPagination.totalPages > 1 && (
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, callsPagination.totalPages) }, (_, i) => {
                                let pageNum;
                                if (callsPagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (callsPagination.currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (callsPagination.currentPage >= callsPagination.totalPages - 2) {
                                  pageNum = callsPagination.totalPages - 4 + i;
                                } else {
                                  pageNum = callsPagination.currentPage - 2 + i;
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handleCallsPageChange(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${callsPagination.currentPage === pageNum
                                      ? 'bg-primary-600 text-white border-primary-600'
                                      : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
                                      }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <button
                            onClick={() => handleCallsPageChange(callsPagination.currentPage + 1)}
                            disabled={callsPagination.currentPage >= callsPagination.totalPages}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Next page"
                          >
                            Next
                          </button>
                          <button
                            onClick={() => handleCallsPageChange(callsPagination.totalPages)}
                            disabled={callsPagination.currentPage >= callsPagination.totalPages}
                            className="px-3 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Last page"
                          >
                            Last
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
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardOverview


