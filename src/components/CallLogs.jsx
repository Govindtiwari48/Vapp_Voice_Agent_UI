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
  TrendingUp,
  Users
} from 'lucide-react'
import { getCallsByCampaignId, getCallsByTID, formatStartDateForAPI, formatEndDateForAPI, getDateRange, getCampaignExternalStatus } from '../api'
import StatusFilter from './StatusFilter'
import RecordingPlayer from './RecordingPlayer'

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
  const [externalMetrics, setExternalMetrics] = useState(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  // Get campaign ID
  const campaignId = campaign?._id || campaign?.id

  // Fetch external metrics when campaign changes
  useEffect(() => {
    const fetchExternalMetrics = async () => {
      // Get TID from campaign - use first TID if available
      const tid = campaign?.tids && campaign.tids.length > 0 ? campaign.tids[0] : null

      if (!tid) {
        setExternalMetrics(null)
        return
      }

      setLoadingMetrics(true)
      try {
        const result = await getCampaignExternalStatus(tid)

        if (result.success && result.data) {
          // Calculate metrics from external API data
          const callData = result.data.data || []
          const summary = result.summary || {}

          // Calculate total calls
          const totalCalls = summary.total || callData.length || 0

          // Calculate successful calls (answered)
          const successfulCalls = summary.answered || callData.filter(call =>
            call.status && call.status.toLowerCase() === 'answered'
          ).length || 0

          // Calculate average duration
          let avgDuration = null
          if (callData.length > 0) {
            const durations = callData
              .filter(call => call.answer_time && call.hangup_time)
              .map(call => {
                const answerTime = new Date(call.answer_time)
                const hangupTime = new Date(call.hangup_time)
                return (hangupTime - answerTime) / 1000 // Duration in seconds
              })
              .filter(duration => duration > 0)

            if (durations.length > 0) {
              const totalSeconds = durations.reduce((sum, d) => sum + d, 0)
              const avgSeconds = Math.round(totalSeconds / durations.length)
              const mins = Math.floor(avgSeconds / 60)
              const secs = avgSeconds % 60
              avgDuration = `${mins}:${String(secs).padStart(2, '0')}`
            }
          }

          // Calculate success rate
          const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0

          setExternalMetrics({
            totalCalls,
            successfulCalls,
            avgDuration,
            successRate,
            summary,
            callData
          })
        } else {
          setExternalMetrics(null)
        }
      } catch (error) {
        console.error('Error fetching external metrics:', error)
        setExternalMetrics(null)
      } finally {
        setLoadingMetrics(false)
      }
    }

    fetchExternalMetrics()
  }, [campaign?.tids])

  // Fetch calls when campaign, filters, or pagination changes
  useEffect(() => {
    const fetchCalls = async () => {
      if (!campaignId) {
        setLoading(false)
        setCalls([])
        return
      }

      setLoading(true)
      setError('')

      try {
        // Build date range if filter is active
        let dateRange = null
        if (activeFilter !== 'today') {
          if (activeFilter === 'custom' && customDates.startDate && customDates.endDate) {
            dateRange = {
              startDate: formatStartDateForAPI(new Date(customDates.startDate)),
              endDate: formatEndDateForAPI(new Date(customDates.endDate))
            }
          } else if (activeFilter !== 'custom') {
            dateRange = getDateRange(activeFilter)
          }
        }

        // Use TIDs if available, otherwise fallback to campaignId
        let result
        if (campaign?.tids && campaign.tids.length > 0) {
          // Fetch calls using TID(s) from campaign
          result = await getCallsByTID(
            campaign.tids, // Array of TIDs
            {
              status: statusFilter || undefined,
              startDate: dateRange?.startDate,
              endDate: dateRange?.endDate,
              page: pagination.currentPage,
              limit: pagination.limit
            }
          )
        } else {
          // Fallback: fetch calls by campaignId if no TIDs
          result = await getCallsByCampaignId(campaignId, {
            status: statusFilter || undefined,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
            page: pagination.currentPage,
            limit: pagination.limit
          })
        }

        if (result && result.calls) {
          setCalls(result.calls)
          setPagination(prev => ({
            ...prev,
            currentPage: result.currentPage || 1,
            totalPages: result.totalPages || 1,
            totalRecords: result.totalRecords || 0,
            limit: result.limit || 20
          }))
        } else {
          setCalls([])
        }
      } catch (error) {
        console.error('Error fetching calls:', error)
        setError(error.message || 'Failed to load call logs')
        setCalls([])
      } finally {
        setLoading(false)
      }
    }

    fetchCalls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, campaign?.tids, activeFilter, statusFilter, pagination.currentPage, customDates.startDate, customDates.endDate])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    if (filter === 'custom') {
      setShowCustomDatePicker(true)
    }
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleClearFilters = () => {
    setActiveFilter('today')
    setStatusFilter('')
    setCustomDates({ startDate: '', endDate: '' })
    setShowCustomDatePicker(false)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
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
    // TODO: Implement XLSX download functionality
    setError('Download functionality coming soon')
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, currentPage: newPage })
  }

  // Transform API call data to match UI expectations
  const transformCallData = (call) => {
    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
      if (seconds === null || seconds === undefined) return '0:00'
      if (typeof seconds === 'string' && seconds.includes(':')) return seconds
      const numSeconds = typeof seconds === 'number' ? seconds : parseInt(seconds, 10)
      if (isNaN(numSeconds)) return '0:00'
      const mins = Math.floor(numSeconds / 60)
      const secs = numSeconds % 60
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
      campaignType: call.campaignType,
      campaignId: call.campaignId
    }
  }

  // Transform calls for display
  const displayCalls = calls.map(transformCallData)

  // Calculate average duration from call log data
  const calculateAvgDurationFromCalls = () => {
    if (!calls || calls.length === 0) return null

    // Helper function to convert duration to seconds
    const durationToSeconds = (duration) => {
      if (duration === null || duration === undefined) return null

      // If it's already a number, assume it's in seconds
      if (typeof duration === 'number') {
        return duration > 0 ? duration : null
      }

      // If it's a string in "MM:SS" format
      if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':')
        if (parts.length === 2) {
          const mins = parseInt(parts[0], 10)
          const secs = parseInt(parts[1], 10)
          if (!isNaN(mins) && !isNaN(secs)) {
            return mins * 60 + secs
          }
        }
        return null
      }

      // Try to parse as number
      const numSeconds = parseInt(duration, 10)
      if (!isNaN(numSeconds) && numSeconds > 0) {
        return numSeconds
      }

      return null
    }

    // Calculate duration from start and end times if available
    const getDurationFromTimestamps = (call) => {
      if (call.start && call.end) {
        try {
          const startTime = new Date(call.start)
          const endTime = new Date(call.end)
          if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
            const diffSeconds = Math.floor((endTime - startTime) / 1000)
            return diffSeconds > 0 ? diffSeconds : null
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      return null
    }

    // Collect all valid durations
    const durations = calls
      .map(call => {
        // First try to get duration from call.duration field
        let duration = durationToSeconds(call.duration)

        // If not available, try to calculate from start/end timestamps
        if (!duration) {
          duration = getDurationFromTimestamps(call)
        }

        return duration
      })
      .filter(d => d !== null && d > 0)

    if (durations.length === 0) return null

    // Calculate average
    const totalSeconds = durations.reduce((sum, d) => sum + d, 0)
    const avgSeconds = Math.round(totalSeconds / durations.length)

    // Format as MM:SS
    const mins = Math.floor(avgSeconds / 60)
    const secs = avgSeconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // Get average duration from call log data
  const avgDurationFromCalls = calculateAvgDurationFromCalls()

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


  // Helper functions to get campaign metrics from external API
  const getTotalCalls = () => {
    if (externalMetrics) {
      return externalMetrics.totalCalls
    }
    return null
  }

  const getSuccessfulCalls = () => {
    if (externalMetrics) {
      return externalMetrics.successfulCalls
    }
    return null
  }

  const getAvgDuration = () => {
    // Prioritize average duration calculated from call log data
    if (avgDurationFromCalls) {
      return avgDurationFromCalls
    }
    // Fallback to external metrics if available
    if (externalMetrics && externalMetrics.avgDuration) {
      return externalMetrics.avgDuration
    }
    return null
  }

  const getSuccessRate = () => {
    if (externalMetrics) {
      return externalMetrics.successRate
    }
    return null
  }

  // Helper function to display value or NA (but show 0 if value is 0)
  const displayValue = (value) => {
    if (value === 0 || value === '0') return '0'
    if (value === null || value === undefined || value === '') return 'NA'
    return value
  }

  // Get metrics from external API
  const totalCalls = getTotalCalls()
  const successfulCalls = getSuccessfulCalls()
  const avgDuration = getAvgDuration()
  const successRate = getSuccessRate()

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
  const settings = campaign?.settings || {}
  const voiceSettings = settings?.voiceSettings || {}
  const workingHours = settings?.workingHours || {}
  const phoneNumbers = campaign?.phoneNumbers || []

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
                    {campaign?.tids && campaign.tids.length > 0 ? `TID: ${campaign.tids.join(', ')}` : displayValue(campaign?.id || campaign?._id)} • {pagination.totalRecords > 0 ? `${pagination.totalRecords} call${pagination.totalRecords !== 1 ? 's' : ''}` : (loadingMetrics ? 'Loading metrics...' : 'Loading calls...')}
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
        {(!loadingMetrics || avgDurationFromCalls !== null) && (totalCalls !== null || successfulCalls !== null || avgDuration !== null || successRate !== null) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {totalCalls !== null && (
              <div className="card p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-secondary-500">Total Calls</p>
                  <Phone className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900">{displayValue(totalCalls)}</p>
              </div>
            )}
            {successfulCalls !== null && (
              <div className="card p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-secondary-500">Successful</p>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{displayValue(successfulCalls)}</p>
              </div>
            )}
            {avgDuration !== null && (
              <div className="card p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-secondary-500">Avg Duration</p>
                  <Clock className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900">{displayValue(avgDuration)}</p>
              </div>
            )}
            {successRate !== null && (
              <div className="card p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-secondary-500">Success Rate</p>
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {successRate !== null ? `${successRate}%` : 'NA'}
                </p>
              </div>
            )}
          </div>
        )}

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
          {!loadingMetrics && externalMetrics && (
            <div className="space-y-6">
              <div className="card p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  {totalCalls !== null && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Total Calls</p>
                      <p className="text-2xl font-bold text-secondary-900">{totalCalls}</p>
                    </div>
                  )}
                  {successfulCalls !== null && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Successful Calls</p>
                      <p className="text-xl font-semibold text-green-600">{successfulCalls}</p>
                    </div>
                  )}
                  {successRate !== null && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-primary-600">{successRate}%</p>
                    </div>
                  )}
                  {avgDuration !== null && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                      <p className="text-lg font-semibold text-secondary-900">{avgDuration}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Status Breakdown */}
              {externalMetrics.summary && Object.keys(externalMetrics.summary).length > 0 && (
                <div className="card p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Call Status</h3>
                  <div className="space-y-3">
                    {externalMetrics.summary.answered !== undefined && externalMetrics.summary.answered !== null && (
                      <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                        <span className="text-sm text-secondary-600">Answered</span>
                        <span className="text-sm font-semibold text-green-600">
                          {externalMetrics.summary.answered}
                        </span>
                      </div>
                    )}
                    {externalMetrics.summary.busy !== undefined && externalMetrics.summary.busy !== null && (
                      <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                        <span className="text-sm text-secondary-600">Busy</span>
                        <span className="text-sm font-semibold text-yellow-600">
                          {externalMetrics.summary.busy}
                        </span>
                      </div>
                    )}
                    {externalMetrics.summary.null !== undefined && externalMetrics.summary.null !== null && externalMetrics.summary.null > 0 && (
                      <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
                        <span className="text-sm text-secondary-600">No Answer</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {externalMetrics.summary.null}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors ${activeFilter === filter.value
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <StatusFilter
                    options={statusFilterOptions}
                    selectedValue={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Filter by Status"
                    className="flex-shrink-0"
                  />
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wide border border-secondary-300 text-secondary-700 hover:bg-secondary-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Custom Date Picker */}
                {showCustomDatePicker && (
                  <div className="flex flex-wrap gap-2 items-center p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                    <input
                      type="date"
                      value={customDates.startDate}
                      onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
                      className="px-3 py-2 text-xs border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-xs text-secondary-600">to</span>
                    <input
                      type="date"
                      value={customDates.endDate}
                      onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
                      min={customDates.startDate}
                      className="px-3 py-2 text-xs border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleCustomDateSubmit}
                      disabled={!customDates.startDate || !customDates.endDate}
                      className="px-3 py-2 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomDatePicker(false)
                        setCustomDates({ startDate: '', endDate: '' })
                        setActiveFilter('today')
                      }}
                      className="px-3 py-2 text-xs font-medium border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Download Button Row */}
                <div className="flex justify-end">
                  <button
                    onClick={handleDownload}
                    disabled={downloading || calls.length === 0}
                    className="btn-secondary inline-flex items-center justify-center space-x-2 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="px-6 py-5 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Call Detail Record</h2>
              {/* <p className="text-sm text-secondary-500 mt-1">Incoming/Outgoing numbers, spend & dispositions</p> */}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Call ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      VMN
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      Campaign Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 uppercase tracking-wider min-w-[200px]">
                      Recording
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {displayCalls.length > 0 ? (
                    displayCalls.map((call) => (
                      <tr
                        key={call.id}
                        className="hover:bg-secondary-50 cursor-pointer transition-colors"
                        onClick={() => onSelectCall && onSelectCall(call)}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          {getStatusBadge(call.status)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-secondary-400" />
                            <span className="text-sm font-medium text-secondary-900">{call.id?.slice(-8) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-secondary-400" />
                            <span className="text-sm text-secondary-900">{call.phoneNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-secondary-700">{call.vmn || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">{call.date || '—'}</div>
                          <div className="text-xs text-secondary-500">{call.time || '—'}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-secondary-400" />
                            <span className="text-sm text-secondary-900">{call.duration || '0:00'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {call.campaignType ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${call.campaignType === 'inbound'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                              {call.campaignType === 'inbound' ? 'Inbound' : 'Outbound'}
                            </span>
                          ) : (
                            <span className="text-sm text-secondary-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                          <RecordingPlayer recordingUrl={call.recordingUrl} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Phone className="w-8 h-8 text-secondary-400 mb-2" />
                          <p className="text-sm font-medium text-secondary-600">No calls found</p>
                          <p className="text-xs text-secondary-500 mt-1">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'This campaign has no call logs yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
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
              {/* <p className="text-xs text-secondary-500 mt-0.5">Incoming/Outgoing numbers, spend & dispositions</p> */}
            </div>
            {displayCalls.length > 0 ? (
              displayCalls.map((call) => (
                <div
                  key={call.id}
                  className="card p-4 cursor-pointer hover:bg-secondary-50 transition-colors"
                  onClick={() => onSelectCall && onSelectCall(call)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-secondary-900 truncate">{call.phoneNumber || 'N/A'}</span>
                    </div>
                    {getStatusBadge(call.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span className="text-xs text-secondary-600">VMN: {call.vmn || 'N/A'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-secondary-900">{call.date || '—'}</div>
                        <div className="text-xs text-secondary-500">{call.time || '—'} • {call.duration || '0:00'}</div>
                      </div>
                    </div>

                    {call.campaignType && (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${call.campaignType === 'inbound'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                          {call.campaignType === 'inbound' ? 'Inbound' : 'Outbound'}
                        </span>
                      </div>
                    )}

                    {call.recordingUrl && (
                      <div className="pt-2 border-t border-secondary-200" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-1">
                          <p className="text-xs font-medium text-secondary-500 mb-2">Recording</p>
                        </div>
                        <RecordingPlayer recordingUrl={call.recordingUrl} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-8 text-center">
                <Phone className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-secondary-600">No calls found</p>
                <p className="text-xs text-secondary-500 mt-1">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'This campaign has no call logs yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note: Empty state removed since we're showing NA in the table instead */}

        {/* Pagination Controls */}
        {!loading && (pagination.totalPages > 1 || pagination.totalRecords > pagination.limit) && (
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

