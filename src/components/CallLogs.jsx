import { useState, useEffect } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Home,
  IndianRupee,
  Phone,
  XCircle,
  Loader2
} from 'lucide-react'
import { getCalls, getDateRange, downloadDashboardExport } from '../api'

const filterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 15 days', value: 'last15' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'Custom range', value: 'custom' }
]

const CallLogs = ({ campaign, type, onSelectCall, onBack, onHome }) => {
  const [activeFilter, setActiveFilter] = useState('today')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [calls, setCalls] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [downloading, setDownloading] = useState(false)
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  })

  // Fetch calls when component mounts or filter changes
  useEffect(() => {
    fetchCalls()
  }, [activeFilter, pagination.currentPage])

  const fetchCalls = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit
      }
      
      // Add date range based on active filter
      if (activeFilter !== 'custom') {
        const dateRange = getDateRange(activeFilter)
        if (dateRange.startDate && dateRange.endDate) {
          params.startDate = dateRange.startDate
          params.endDate = dateRange.endDate
        }
      } else if (customDates.startDate && customDates.endDate) {
        params.startDate = new Date(customDates.startDate).toISOString()
        params.endDate = new Date(customDates.endDate).toISOString()
      }
      
      const response = await getCalls(params)
      
      setCalls(response.calls || [])
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalRecords: response.totalRecords || 0,
        limit: response.limit || 20
      })
    } catch (err) {
      setError(err.message || 'Failed to load call logs')
      console.error('Call logs error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setPagination({ ...pagination, currentPage: 1 })
    if (filter === 'custom') {
      setShowCustomDatePicker(true)
    }
  }

  const handleCustomDateSubmit = () => {
    if (customDates.startDate && customDates.endDate) {
      setShowCustomDatePicker(false)
      setPagination({ ...pagination, currentPage: 1 })
      fetchCalls()
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const params = { range: activeFilter }
      
      if (activeFilter === 'custom' && customDates.startDate && customDates.endDate) {
        params.startDate = customDates.startDate
        params.endDate = customDates.endDate
      }
      
      const filename = `call-logs-${activeFilter}-${new Date().toISOString().split('T')[0]}.xlsx`
      await downloadDashboardExport(params, filename)
    } catch (err) {
      setError(err.message || 'Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Use calls from API only
  const displayCalls = calls
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'no-answer':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Phone className="w-4 h-4 text-secondary-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'no-answer':
        return <span className="badge badge-error">No Answer</span>
      case 'busy':
        return <span className="badge badge-warning">Busy</span>
      default:
        return <span className="badge">Unknown</span>
    }
  }

  const getQualificationBadge = (qualification) => {
    switch (qualification) {
      case 'show-project':
        return <span className="badge badge-info">Show Project</span>
      case 'callback':
        return <span className="badge badge-warning">Callback Required</span>
      default:
        return null
    }
  }

  const formattedSuccessRate = campaign.totalCalls
    ? Math.round((campaign.successfulCalls / campaign.totalCalls) * 100)
    : 0

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—'
    return `₹ ${value.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                title="Home"
                aria-label="Home"
              >
                <Home className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">{campaign.name}</h1>
                  {campaign.status === 'active' ? (
                    <span className="badge badge-success flex-shrink-0">Active</span>
                  ) : (
                    <span className="badge badge-warning flex-shrink-0">Paused</span>
                  )}
                </div>
                <p className="text-xs text-secondary-500 mt-0.5 truncate">
                  {campaign.id} • {pagination.totalRecords || calls.length} calls
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card p-3 sm:p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Total Calls</p>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">{campaign.totalCalls}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Successful</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{campaign.successfulCalls}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Avg Duration</p>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">{campaign.avgDuration}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Success Rate</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {formattedSuccessRate}%
            </p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-secondary-500">Allocated DID Number</p>
              <p className="text-lg sm:text-xl font-semibold text-secondary-900 break-words">{campaign.allocatedDid || 'Not assigned'}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border touch-manipulation disabled:opacity-50 ${
                      activeFilter === filter.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-secondary-200 text-secondary-600 hover:text-secondary-900 active:bg-secondary-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleDownload}
                disabled={downloading || loading}
                className="btn-secondary inline-flex items-center justify-center space-x-2 text-sm w-full sm:w-auto disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? 'Downloading...' : 'Download XLSX'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading call logs</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchCalls}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Date Picker */}
        {showCustomDatePicker && activeFilter === 'custom' && (
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
                onClick={() => setShowCustomDatePicker(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="ml-3 text-secondary-600">Loading call logs...</p>
            </div>
          </div>
        )}

        {/* Call Logs - Desktop Table View */}
        {!loading && (
        <div className="card hidden md:block">
          <div className="px-4 sm:px-6 py-4 border-b border-secondary-200">
            <h2 className="text-base font-semibold text-secondary-900">Call Detail Record</h2>
            <p className="text-xs text-secondary-500 mt-0.5">Incoming/Outgoing numbers, spend & dispositions</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Call ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Spend (INR)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Disposition Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {displayCalls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call)}
                    className="hover:bg-secondary-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{getStatusBadge(call.status)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(call.status)}
                        <span className="text-sm font-medium text-secondary-900">{call.id}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-900">{call.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{call.date}</div>
                      <div className="text-xs text-secondary-500">{call.time}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-900">{call.duration}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm font-medium text-secondary-900">{formatCurrency(call.spendInr)}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {call.dispositionType ? (
                        <span className={`badge ${call.dispositionType === 'Successful' ? 'badge-success' : 'badge-warning'}`}>
                          {call.dispositionType}
                        </span>
                      ) : (
                        getStatusBadge(call.status)
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-primary-600 font-semibold">
                      {call.recommendedAction || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Call Logs - Mobile Card View */}
        {!loading && (
        <div className="md:hidden space-y-3">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-secondary-900">Call Detail Record</h2>
            <p className="text-xs text-secondary-500 mt-0.5">Tap on any call to view details</p>
          </div>
          {displayCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className="card p-4 cursor-pointer active:bg-secondary-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getStatusIcon(call.status)}
                  <span className="text-sm font-medium text-secondary-900 truncate">{call.id}</span>
                </div>
                {getStatusBadge(call.status)}
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-sm text-secondary-900">{call.phoneNumber}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-secondary-900">{call.date}</div>
                    <div className="text-xs text-secondary-500">{call.time} • {call.duration}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-xs text-secondary-900">{formatCurrency(call.spendInr)}</span>
                </div>

              </div>
              
              {getQualificationBadge(call.leadQualification) && (
                <div className="pt-2 border-t border-secondary-100">
                  {getQualificationBadge(call.leadQualification)}
                </div>
              )}

              {call.recommendedAction && (
                <div className="mt-3 pt-3 border-t border-secondary-100 text-xs font-semibold text-primary-600">
                  Action: {call.recommendedAction}
                </div>
              )}
            </div>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayCalls.length === 0 && (
          <div className="card p-8 text-center">
            <div className="text-secondary-400 mb-4">
              <Phone className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No calls found</h3>
            <p className="text-secondary-500">No calls match your current filter criteria. Try adjusting your date range or filters.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="card p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-600">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} total records)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallLogs

