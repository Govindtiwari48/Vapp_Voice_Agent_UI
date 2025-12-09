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
  PhoneIncoming,
  PhoneOutgoing,
  XCircle,
  Loader2,
  X,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react'
// Note: getCalls, getDateRange, downloadDashboardExport, formatStartDateForAPI, formatEndDateForAPI are not used
// since there's no API for campaign-specific call logs
import StatusFilter from './StatusFilter'

const filterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 15 days', value: 'last15' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'Custom range', value: 'custom' }
]

// Status filter options based on backend API
const statusFilterOptions = [
  { label: 'Answered', value: 'ANSWERED' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'No Answer', value: 'NO ANSWER' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

const CallLogs = ({ campaign, type, onSelectCall, onBack, onHome }) => {
  const [activeFilter, setActiveFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('') // Empty string means "All"
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

  // Note: There is no API for campaign-specific call logs
  // So we show "NA" in the Call Detail Record table
  useEffect(() => {
    // Since there's no API for campaign-specific call logs, we don't fetch calls
    // Instead, we show empty state with NA values
    setLoading(false)
    setCalls([])
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 20
    })
  }, [])

  const fetchCalls = async () => {
    // This function is kept for compatibility but not used
    // since there's no API for campaign-specific call logs
    setLoading(false)
    setCalls([])
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setPagination({ ...pagination, currentPage: 1 })
    if (filter === 'custom') {
      setShowCustomDatePicker(true)
    }
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setPagination({ ...pagination, currentPage: 1 })
  }

  const handleClearFilters = () => {
    setActiveFilter('today')
    setStatusFilter('')
    setCustomDates({ startDate: '', endDate: '' })
    setShowCustomDatePicker(false)
    setPagination({ ...pagination, currentPage: 1 })
  }

  // Check if any filters are active
  const hasActiveFilters = activeFilter !== 'today' || statusFilter !== ''

  // Get active filter label
  const getActiveFilterLabel = () => {
    const filter = filterOptions.find(f => f.value === activeFilter)
    return filter ? filter.label : 'Custom'
  }

  // Get active status label
  const getActiveStatusLabel = () => {
    if (!statusFilter) return null
    const status = statusFilterOptions.find(s => s.value === statusFilter)
    return status ? status.label : statusFilter
  }

  const handleCustomDateSubmit = () => {
    if (customDates.startDate && customDates.endDate) {
      setShowCustomDatePicker(false)
      setPagination({ ...pagination, currentPage: 1 })
      fetchCalls()
    }
  }

  const handleDownload = async () => {
    // Disabled since there's no API for campaign-specific call logs
    setError('Download is not available - no API for campaign-specific call logs')
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Transform API call data to match UI expectations
  const transformCallData = (call) => {
    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
      if (!seconds) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${String(secs).padStart(2, '0')}`
    }

    // Format date and time from ISO string
    const formatDateTime = (isoString) => {
      if (!isoString) return { date: '—', time: '—' }
      const date = new Date(isoString)
      return {
        date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      }
    }

    const dateTime = formatDateTime(call.start)

    return {
      id: call._id || call.id,
      phoneNumber: call.cnum || call.phoneNumber,
      vmn: call.vmn,
      date: dateTime.date,
      time: dateTime.time,
      duration: formatDuration(call.duration),
      status: call.status,
      exeno: call.exeno,
      rfn: call.rfn,
      recordingUrl: call.recordingUrl,
      start: call.start,
      end: call.end,
      createdAt: call.createdAt,
      // Legacy fields for backward compatibility
      spendInr: call.spendInr || 0,
      dispositionType: call.dispositionType,
      leadQualification: call.leadQualification,
      recommendedAction: call.recommendedAction
    }
  }

  // Note: displayCalls is not used since there's no API for campaign-specific call logs
  // const displayCalls = calls.map(transformCallData)

  // Normalize status to handle both API format (ANSWERED) and legacy format (completed)
  const normalizeStatus = (status) => {
    if (!status) return ''
    const upperStatus = status.toUpperCase()
    // Map API status values to normalized values
    if (upperStatus === 'ANSWERED' || upperStatus === 'COMPLETED') return 'answered'
    if (upperStatus === 'NO ANSWER' || upperStatus === 'NO-ANSWER') return 'no-answer'
    if (upperStatus === 'BUSY') return 'busy'
    if (upperStatus === 'FAILED') return 'failed'
    if (upperStatus === 'CANCELLED') return 'cancelled'
    return status.toLowerCase()
  }

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'answered':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'no-answer':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Phone className="w-4 h-4 text-secondary-400" />
    }
  }

  const getStatusBadge = (status) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'answered':
      case 'completed':
        return <span className="badge badge-success">Answered</span>
      case 'no-answer':
        return <span className="badge badge-error">No Answer</span>
      case 'busy':
        return <span className="badge badge-warning">Busy</span>
      case 'failed':
        return <span className="badge badge-error">Failed</span>
      case 'cancelled':
        return <span className="badge badge-warning">Cancelled</span>
      default:
        return <span className="badge">{status || 'Unknown'}</span>
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

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return null
    if (seconds === 0 || seconds === '0') return '0:00'
    // If already formatted (string with :), return as is
    if (typeof seconds === 'string' && seconds.includes(':')) return seconds
    // Convert seconds to MM:SS
    const numSeconds = typeof seconds === 'number' ? seconds : parseInt(seconds, 10)
    if (isNaN(numSeconds)) return null
    const mins = Math.floor(numSeconds / 60)
    const secs = numSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Helper functions to get campaign metrics from either structure
  // Campaign-by-id API returns: campaign.metrics.totalCalls
  // Transformed data from list: campaign.totalCalls
  const getTotalCalls = () => {
    const value = campaign?.totalCalls ?? campaign?.metrics?.totalCalls
    return value !== null && value !== undefined ? value : null
  }

  const getSuccessfulCalls = () => {
    const value = campaign?.successfulCalls ?? campaign?.metrics?.successfulCalls
    return value !== null && value !== undefined ? value : null
  }

  const getAvgDuration = () => {
    // Check if already formatted (from transformed list data)
    const directValue = campaign?.avgDuration
    if (directValue !== null && directValue !== undefined) {
      return directValue
    }
    // Otherwise, format from metrics (from campaign-by-id API)
    const secondsValue = campaign?.metrics?.avgDuration
    return formatDuration(secondsValue)
  }

  // Helper function to display value or NA (but show 0 if value is 0)
  const displayValue = (value) => {
    if (value === 0 || value === '0') return '0'
    if (value === null || value === undefined || value === '') return 'NA'
    return value
  }

  // Calculate success rate
  const totalCalls = getTotalCalls()
  const successfulCalls = getSuccessfulCalls()
  const formattedSuccessRate = totalCalls !== null && totalCalls !== undefined
    ? (totalCalls === 0 ? 0 : (successfulCalls !== null && successfulCalls !== undefined ? Math.round((successfulCalls / totalCalls) * 100) : null))
    : null

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—'
    return `₹ ${value.toFixed(2)}`
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get campaign details from API response
  const isInbound = campaign?.campaignType === 'inbound' || type === 'incoming'
  const metrics = campaign?.metrics || {}
  const settings = campaign?.settings || {}
  const voiceSettings = settings?.voiceSettings || {}
  const workingHours = settings?.workingHours || {}
  const phoneNumbers = campaign?.phoneNumbers || []
  const callsByStatus = metrics?.callsByStatus || {}

  // Calculate additional metrics
  const failedCalls = metrics?.failedCalls !== undefined && metrics?.failedCalls !== null ? metrics.failedCalls : null
  const conversionRate = metrics?.conversionRate !== undefined && metrics?.conversionRate !== null ? metrics.conversionRate : null
  const costPerCall = metrics?.costPerCall !== undefined && metrics?.costPerCall !== null ? metrics.costPerCall : null
  const revenue = metrics?.revenue !== undefined && metrics?.revenue !== null ? metrics.revenue : null

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
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isInbound ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isInbound ? (
                    <PhoneIncoming className={`w-4 h-4 sm:w-5 sm:h-5 text-green-600`} />
                  ) : (
                    <PhoneOutgoing className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-600`} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">{displayValue(campaign?.name)}</h1>
                    {campaign?.status === 'active' ? (
                      <span className="badge badge-success flex-shrink-0">Active</span>
                    ) : campaign?.status ? (
                      <span className="badge badge-warning flex-shrink-0">Paused</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-secondary-500 mt-0.5 truncate">
                    {displayValue(campaign?.id || campaign?._id)} • {displayValue(pagination.totalRecords)} calls
                  </p>
                </div>
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-500">Total Calls</p>
              <Phone className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">{displayValue(getTotalCalls())}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-500">Successful</p>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{displayValue(getSuccessfulCalls())}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-500">Avg Duration</p>
              <Clock className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">{displayValue(getAvgDuration())}</p>
          </div>
          <div className="card p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-500">Success Rate</p>
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {formattedSuccessRate !== null ? `${formattedSuccessRate}%` : 'NA'}
            </p>
          </div>
        </div>

        {/* Campaign Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Campaign Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Information Card */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Campaign Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Campaign Name</p>
                  <p className="text-sm font-medium text-secondary-900">{campaign?.name || 'N/A'}</p>
                </div>
                {campaign?.category && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Category</p>
                    <p className="text-sm font-medium text-secondary-900">{campaign.category}</p>
                  </div>
                )}
                {campaign?.description && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Description</p>
                    <p className="text-sm text-secondary-700">{campaign.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Campaign Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isInbound
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                      {isInbound ? 'Inbound' : 'Outbound'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${campaign?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {campaign?.status || 'N/A'}
                    </span>
                  </div>
                </div>
                {campaign?.startDate && campaign?.endDate && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Start Date</p>
                      <p className="text-sm font-medium text-secondary-900">{formatDate(campaign.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">End Date</p>
                      <p className="text-sm font-medium text-secondary-900">{formatDate(campaign.endDate)}</p>
                    </div>
                  </div>
                )}
                {campaign?.createdAt && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-secondary-900">{formatDate(campaign.createdAt)}</p>
                  </div>
                )}
                {campaign?.createdBy && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Created By</p>
                    <p className="text-sm font-medium text-secondary-900">{campaign.createdBy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Numbers (Outbound only) */}
            {!isInbound && phoneNumbers.length > 0 && (
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">Phone Numbers</h2>
                    <p className="text-xs text-secondary-500 mt-1">Total: {phoneNumbers.length} phone numbers</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {phoneNumbers.slice(0, 5).map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-secondary-50 rounded">
                      <Phone className="w-4 h-4 text-secondary-500" />
                      <span className="text-sm text-secondary-700">{phone}</span>
                    </div>
                  ))}
                  {phoneNumbers.length > 5 && (
                    <p className="text-xs text-secondary-500 text-center pt-2">
                      +{phoneNumbers.length - 5} more phone numbers
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Settings Card */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Call Timeout</p>
                  <p className="text-sm font-medium text-secondary-900">{settings?.callTimeout || 'N/A'} seconds</p>
                </div>
                {!isInbound && (
                  <>
                    {settings?.maxCalls && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Max Calls</p>
                        <p className="text-sm font-medium text-secondary-900">{settings.maxCalls}</p>
                      </div>
                    )}
                    {settings?.retryAttempts !== undefined && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Retry Attempts</p>
                        <p className="text-sm font-medium text-secondary-900">{settings.retryAttempts}</p>
                      </div>
                    )}
                    {workingHours?.start && workingHours?.end && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Working Hours</p>
                        <p className="text-sm font-medium text-secondary-900">
                          {workingHours.start} - {workingHours.end} ({workingHours.timezone || 'N/A'})
                        </p>
                      </div>
                    )}
                  </>
                )}
                {voiceSettings?.voice && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Voice Settings</p>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-secondary-500">Voice</p>
                        <p className="text-sm font-medium text-secondary-900">{voiceSettings.voice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-500">Speed</p>
                        <p className="text-sm font-medium text-secondary-900">{voiceSettings.speed || 1}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-500">Language</p>
                        <p className="text-sm font-medium text-secondary-900">{voiceSettings.language || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Performance Metrics */}
          <div className="space-y-6">
            <div className="card p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Total Calls</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {metrics?.totalCalls !== undefined && metrics?.totalCalls !== null ? metrics.totalCalls : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Successful Calls</p>
                  <p className="text-xl font-semibold text-green-600">
                    {metrics?.successfulCalls !== undefined && metrics?.successfulCalls !== null ? metrics.successfulCalls : 'N/A'}
                  </p>
                </div>
                {failedCalls !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Failed Calls</p>
                    <p className="text-xl font-semibold text-red-600">{failedCalls}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formattedSuccessRate !== null ? `${formattedSuccessRate}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {displayValue(getAvgDuration())}
                  </p>
                </div>
                {conversionRate !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Conversion Rate</p>
                    <p className="text-lg font-semibold text-secondary-900">{conversionRate}%</p>
                  </div>
                )}
                {costPerCall !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Cost Per Call</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {costPerCall}</p>
                  </div>
                )}
                {revenue !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {revenue}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Call Status Breakdown */}
            {Object.keys(callsByStatus).length > 0 && (
              <div className="card p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Call Status</h3>
                <div className="space-y-3">
                  {Object.entries(callsByStatus).map(([status, count]) => {
                    const statusColors = {
                      ANSWERED: 'text-green-600',
                      BUSY: 'text-yellow-600',
                      NO_ANSWER: 'text-orange-600',
                      FAILED: 'text-red-600'
                    }
                    return (
                      <div key={status} className="flex items-center justify-between border-b border-secondary-100 pb-2">
                        <span className="text-sm text-secondary-600">{status}</span>
                        <span className={`text-sm font-semibold ${statusColors[status] || 'text-secondary-900'}`}>
                          {count !== undefined && count !== null ? count : 'N/A'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Allocated DID Number Card */}
        {campaign?.allocatedDid && (
          <div className="card p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-secondary-500">Allocated DID Number</p>
                <p className="text-lg sm:text-xl font-semibold text-secondary-900 break-words">{displayValue(campaign.allocatedDid)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call Logs Section Header */}
        <div className="card p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3">
                {/* Info Banner - No API for campaign-specific call logs */}
                <div className="flex items-start gap-2 p-2 bg-secondary-50 rounded-lg border border-secondary-200">
                  <AlertCircle className="w-4 h-4 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-secondary-600">
                    <span className="font-medium">Note:</span> There is no API available for campaign-specific call logs. The Call Detail Record table shows "NA" for all fields.
                  </p>
                </div>

                {/* Filters Row - Disabled since there's no API for campaign-specific call logs */}
                <div className="flex flex-wrap gap-2 items-center opacity-50 pointer-events-none">
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.value}
                        disabled={true}
                        className="px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border border-secondary-200 text-secondary-600"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <StatusFilter
                    options={statusFilterOptions}
                    selectedValue={statusFilter}
                    onChange={() => { }}
                    label="Filter by Status"
                    disabled={true}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Download Button Row - Disabled since there's no API for campaign-specific call logs */}
                <div className="flex justify-end">
                  <button
                    disabled={true}
                    className="btn-secondary inline-flex items-center justify-center space-x-2 text-sm w-full sm:w-auto opacity-50 cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download XLSX (Not Available)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card p-4 bg-red-50 border border-red-200 mb-4 sm:mb-6">
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

        {/* Custom Date Picker - Hidden since there's no API for campaign-specific call logs */}

        {/* Loading State */}
        {loading && (
          <div className="card p-8 mb-4 sm:mb-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="ml-3 text-secondary-600">Loading call logs...</p>
            </div>
          </div>
        )}

        {/* Call Logs - Desktop Table View */}
        {!loading && (
          <div className="card hidden md:block mb-4 sm:mb-6">
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
                  {/* Since there's no API for campaign-specific call logs, show NA row */}
                  <tr className="cursor-default">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-600">NA</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm font-medium text-secondary-600">NA</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-600">NA</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-600">NA</div>
                      <div className="text-xs text-secondary-500">NA</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-600">NA</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm font-medium text-secondary-600">NA</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-600">NA</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      NA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Call Logs - Mobile Card View */}
        {!loading && (
          <div className="md:hidden space-y-3 mb-4 sm:mb-6">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-secondary-900">Call Detail Record</h2>
              <p className="text-xs text-secondary-500 mt-0.5">Incoming/Outgoing numbers, spend & dispositions</p>
            </div>
            {/* Since there's no API for campaign-specific call logs, show NA card */}
            <div className="card p-4 cursor-default">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Phone className="w-4 h-4 text-secondary-400" />
                  <span className="text-sm font-medium text-secondary-600 truncate">NA</span>
                </div>
                <span className="text-sm text-secondary-600">NA</span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-sm text-secondary-600">NA</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-secondary-600">NA</div>
                    <div className="text-xs text-secondary-500">NA • NA</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                  <span className="text-xs text-secondary-600">NA</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note: Empty state removed since we're showing NA in the table instead */}

        {/* Pagination Controls - Hidden since there's no API for campaign-specific call logs */}
        {false && !loading && (pagination.totalPages > 1 || pagination.totalRecords > pagination.limit) && (
          <div className="card p-4 sm:p-6 mt-6 border-2 border-primary-200 bg-primary-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm sm:text-base font-medium text-secondary-700">
                Showing <span className="font-bold text-primary-700">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-primary-700">{Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}</span> of <span className="font-bold text-primary-700">{pagination.totalRecords}</span> total records
                {pagination.totalPages > 1 && (
                  <span className="text-secondary-600 ml-2">(Page {pagination.currentPage} of {pagination.totalPages})</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  Previous
                </button>

                {/* Page Number Buttons */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${pagination.currentPage === pageNum
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
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  Last
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

