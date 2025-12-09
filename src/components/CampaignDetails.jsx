import { useState } from 'react'
import { ArrowLeft, Home, PhoneIncoming, PhoneOutgoing, Calendar, Clock, Target, TrendingUp, Phone, Users, CheckCircle, XCircle, AlertCircle, Edit2, Settings as SettingsIcon, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { updateCampaignBasicInfo, updateCampaignSettings, updateCampaignPhoneNumbers, updateCampaignStatus } from '../api'

const CampaignDetails = ({ campaign, onBack, onHome }) => {
  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Phone numbers pagination
  const [phoneNumberPage, setPhoneNumberPage] = useState(1)
  const phoneNumbersPerPage = 10

  // Form states
  const [editForm, setEditForm] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    status: campaign?.status || 'active'
  })

  const [settingsForm, setSettingsForm] = useState({
    maxCalls: campaign?.settings?.maxCalls || '',
    callTimeout: campaign?.settings?.callTimeout || 30,
    retryAttempts: campaign?.settings?.retryAttempts || '',
    workingHoursStart: campaign?.settings?.workingHours?.start || '',
    workingHoursEnd: campaign?.settings?.workingHours?.end || '',
    timezone: campaign?.settings?.workingHours?.timezone || 'Asia/Kolkata'
  })

  const [phoneNumbers, setPhoneNumbers] = useState(campaign?.phoneNumbers || [])
  const [newPhoneNumber, setNewPhoneNumber] = useState('')

  if (!campaign) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600">Campaign not found</p>
        </div>
      </div>
    )
  }

  const isInbound = campaign.campaignType === 'inbound'
  const metrics = campaign.metrics || {}
  const settings = campaign.settings || {}
  const voiceSettings = settings.voiceSettings || {}
  const workingHours = settings.workingHours || {}

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate success rate - 0 is a valid value, only null/undefined means N/A
  const successRate = (metrics.totalCalls !== undefined && metrics.totalCalls !== null &&
    metrics.successfulCalls !== undefined && metrics.successfulCalls !== null)
    ? (metrics.totalCalls > 0
      ? Math.round((metrics.successfulCalls / metrics.totalCalls) * 100)
      : 0) // If totalCalls is 0, success rate is 0%
    : null

  const callsByStatus = metrics.callsByStatus || {}

  // Phone numbers pagination
  const totalPhonePages = Math.ceil(phoneNumbers.length / phoneNumbersPerPage)
  const paginatedPhoneNumbers = phoneNumbers.slice(
    (phoneNumberPage - 1) * phoneNumbersPerPage,
    phoneNumberPage * phoneNumbersPerPage
  )

  // Handle edit campaign
  const handleSaveEdit = async () => {
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const campaignId = campaign._id || campaign.id
      const result = await updateCampaignBasicInfo(campaignId, editForm)

      if (result.success) {
        setSuccess('Campaign updated successfully!')
        setEditModalOpen(false)
        // Update local campaign data
        Object.assign(campaign, {
          name: editForm.name,
          description: editForm.description,
          status: editForm.status
        })
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to update campaign')
    } finally {
      setUpdating(false)
    }
  }

  // Handle save settings
  const handleSaveSettings = async () => {
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const campaignId = campaign._id || campaign.id
      const settingsData = {
        callTimeout: parseInt(settingsForm.callTimeout) || 30,
      }

      if (!isInbound) {
        if (settingsForm.maxCalls) settingsData.maxCalls = parseInt(settingsForm.maxCalls)
        if (settingsForm.retryAttempts) settingsData.retryAttempts = parseInt(settingsForm.retryAttempts)

        if (settingsForm.workingHoursStart && settingsForm.workingHoursEnd) {
          settingsData.workingHours = {
            start: settingsForm.workingHoursStart,
            end: settingsForm.workingHoursEnd,
            timezone: settingsForm.timezone
          }
        }
      }

      const result = await updateCampaignSettings(campaignId, settingsData)

      if (result.success) {
        setSuccess('Settings updated successfully!')
        setSettingsModalOpen(false)
        Object.assign(campaign.settings, settingsData)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setUpdating(false)
    }
  }

  // Handle add phone number
  const handleAddPhoneNumber = () => {
    if (newPhoneNumber.trim()) {
      // Validate phone number format (basic validation)
      const cleanedNumber = newPhoneNumber.trim()
      if (!phoneNumbers.includes(cleanedNumber)) {
        setPhoneNumbers([...phoneNumbers, cleanedNumber])
        setNewPhoneNumber('')
      } else {
        setError('Phone number already exists')
        setTimeout(() => setError(''), 3000)
      }
    }
  }

  // Handle remove phone number
  const handleRemovePhoneNumber = (index) => {
    const actualIndex = (phoneNumberPage - 1) * phoneNumbersPerPage + index
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== actualIndex))
  }

  // Handle save phone numbers
  const handleSavePhoneNumbers = async () => {
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const campaignId = campaign._id || campaign.id
      const result = await updateCampaignPhoneNumbers(campaignId, phoneNumbers)

      if (result.success) {
        setSuccess('Phone numbers updated successfully!')
        setPhoneModalOpen(false)
        campaign.phoneNumbers = phoneNumbers
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to update phone numbers')
    } finally {
      setUpdating(false)
    }
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
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0"
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
                  <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">
                    {campaign.name}
                  </h1>
                  <p className="text-xs text-secondary-500">
                    {isInbound ? 'Inbound' : 'Outbound'} Campaign Details
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                title="Edit Campaign"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </button>
              {!isInbound && (
                <button
                  onClick={() => setSettingsModalOpen(true)}
                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Campaign Settings"
                >
                  <SettingsIcon className="w-4 h-4 text-purple-600" />
                </button>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {campaign.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Campaign Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Total Calls</p>
              <Phone className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">
              {metrics.totalCalls !== undefined && metrics.totalCalls !== null ? metrics.totalCalls : 'N/A'}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Successful Calls</p>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {metrics.successfulCalls !== undefined && metrics.successfulCalls !== null ? metrics.successfulCalls : 'N/A'}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Success Rate</p>
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-primary-600">
              {successRate !== null ? `${successRate}%` : 'N/A'}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Avg Duration</p>
              <Clock className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">
              {metrics.avgDuration !== undefined && metrics.avgDuration !== null ? formatDuration(metrics.avgDuration) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Campaign Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Campaign Name</p>
                  <p className="text-sm font-medium text-secondary-900">{campaign.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-secondary-900">{campaign.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Description</p>
                  <p className="text-sm text-secondary-700">{campaign.description || 'N/A'}</p>
                </div>
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                {campaign.startDate && campaign.endDate && (
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
                {campaign.createdAt && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-secondary-900">{formatDate(campaign.createdAt)}</p>
                  </div>
                )}
                {campaign.createdBy && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Created By</p>
                    <p className="text-sm font-medium text-secondary-900">{campaign.createdBy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Numbers (Outbound only) */}
            {!isInbound && (
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">Phone Numbers</h2>
                    <p className="text-xs text-secondary-500 mt-1">Total: {phoneNumbers.length} phone numbers</p>
                  </div>
                  <button
                    onClick={() => setPhoneModalOpen(true)}
                    className="btn-primary text-sm inline-flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Manage</span>
                  </button>
                </div>

                {phoneNumbers.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      {paginatedPhoneNumbers.map((phone, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-secondary-50 rounded">
                          <Phone className="w-4 h-4 text-secondary-500" />
                          <span className="text-sm text-secondary-700">{phone}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pagination for Phone Numbers */}
                    {totalPhonePages > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t border-secondary-200">
                        <div className="text-xs text-secondary-600">
                          Showing {((phoneNumberPage - 1) * phoneNumbersPerPage) + 1} - {Math.min(phoneNumberPage * phoneNumbersPerPage, phoneNumbers.length)} of {phoneNumbers.length}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPhoneNumberPage(prev => Math.max(1, prev - 1))}
                            disabled={phoneNumberPage === 1}
                            className="px-3 py-1 text-xs font-medium rounded border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-secondary-600">
                            {phoneNumberPage} / {totalPhonePages}
                          </span>
                          <button
                            onClick={() => setPhoneNumberPage(prev => Math.min(totalPhonePages, prev + 1))}
                            disabled={phoneNumberPage === totalPhonePages}
                            className="px-3 py-1 text-xs font-medium rounded border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <Phone className="w-8 h-8 mx-auto mb-2 text-secondary-400" />
                    <p className="text-sm">No phone numbers added yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Call Timeout</p>
                  <p className="text-sm font-medium text-secondary-900">{settings.callTimeout || 'N/A'} seconds</p>
                </div>
                {!isInbound && (
                  <>
                    {settings.maxCalls && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Max Calls</p>
                        <p className="text-sm font-medium text-secondary-900">{settings.maxCalls}</p>
                      </div>
                    )}
                    {settings.retryAttempts !== undefined && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Retry Attempts</p>
                        <p className="text-sm font-medium text-secondary-900">{settings.retryAttempts}</p>
                      </div>
                    )}
                    {workingHours.start && workingHours.end && (
                      <div>
                        <p className="text-xs text-secondary-500 mb-1">Working Hours</p>
                        <p className="text-sm font-medium text-secondary-900">
                          {workingHours.start} - {workingHours.end} ({workingHours.timezone || 'N/A'})
                        </p>
                      </div>
                    )}
                  </>
                )}
                {voiceSettings.voice && (
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metrics Summary */}
            <div className="card p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Total Calls</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {metrics.totalCalls !== undefined && metrics.totalCalls !== null ? metrics.totalCalls : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Successful Calls</p>
                  <p className="text-xl font-semibold text-green-600">
                    {metrics.successfulCalls !== undefined && metrics.successfulCalls !== null ? metrics.successfulCalls : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Failed Calls</p>
                  <p className="text-xl font-semibold text-red-600">
                    {metrics.failedCalls !== undefined && metrics.failedCalls !== null ? metrics.failedCalls : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {successRate !== null ? `${successRate}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {metrics.avgDuration !== undefined && metrics.avgDuration !== null ? formatDuration(metrics.avgDuration) : 'N/A'}
                  </p>
                </div>
                {metrics.conversionRate !== undefined && metrics.conversionRate !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Conversion Rate</p>
                    <p className="text-lg font-semibold text-secondary-900">{metrics.conversionRate}%</p>
                  </div>
                )}
                {metrics.costPerCall !== undefined && metrics.costPerCall !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Cost Per Call</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metrics.costPerCall}</p>
                  </div>
                )}
                {metrics.revenue !== undefined && metrics.revenue !== null && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metrics.revenue}</p>
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

        {/* Success/Error Messages */}
        {success && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Success</p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
              <button onClick={() => setSuccess('')} className="p-1 hover:bg-green-100 rounded transition-colors">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded transition-colors">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Campaign Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Edit Campaign</h3>
                <button onClick={() => setEditModalOpen(false)} className="p-1 hover:bg-secondary-100 rounded-lg">
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="input w-full"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input w-full"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button onClick={handleSaveEdit} disabled={!editForm.name || updating} className="btn-primary flex-1">
                  {updating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
                </button>
                <button onClick={() => setEditModalOpen(false)} className="btn-secondary flex-1" disabled={updating}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Campaign Settings</h3>
                <button onClick={() => setSettingsModalOpen(false)} className="p-1 hover:bg-secondary-100 rounded-lg">
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Call Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settingsForm.callTimeout}
                    onChange={(e) => setSettingsForm({ ...settingsForm, callTimeout: e.target.value })}
                    className="input w-full"
                    min="1"
                  />
                </div>

                {!isInbound && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Max Calls</label>
                      <input
                        type="number"
                        value={settingsForm.maxCalls}
                        onChange={(e) => setSettingsForm({ ...settingsForm, maxCalls: e.target.value })}
                        className="input w-full"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Retry Attempts</label>
                      <input
                        type="number"
                        value={settingsForm.retryAttempts}
                        onChange={(e) => setSettingsForm({ ...settingsForm, retryAttempts: e.target.value })}
                        className="input w-full"
                        min="0"
                      />
                    </div>

                    <div className="border-t border-secondary-200 pt-4">
                      <h4 className="text-sm font-semibold text-secondary-900 mb-3">Working Hours</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-secondary-700 mb-2">Start</label>
                          <input
                            type="time"
                            value={settingsForm.workingHoursStart}
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursStart: e.target.value })}
                            className="input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-secondary-700 mb-2">End</label>
                          <input
                            type="time"
                            value={settingsForm.workingHoursEnd}
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursEnd: e.target.value })}
                            className="input w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-700 mb-2">Timezone</label>
                        <select
                          value={settingsForm.timezone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                          className="input w-full text-sm"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button onClick={handleSaveSettings} disabled={updating} className="btn-primary flex-1">
                  {updating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Settings'}
                </button>
                <button onClick={() => setSettingsModalOpen(false)} className="btn-secondary flex-1" disabled={updating}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Numbers Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Manage Phone Numbers</h3>
                <button onClick={() => setPhoneModalOpen(false)} className="p-1 hover:bg-secondary-100 rounded-lg">
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              {/* Add New Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">Add Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPhoneNumber()}
                  />
                  <button onClick={handleAddPhoneNumber} className="btn-primary inline-flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Format: +[country code][number]</p>
              </div>

              {/* Phone Numbers List */}
              <div className="border border-secondary-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-secondary-700">Phone Numbers ({phoneNumbers.length})</p>
                </div>

                {phoneNumbers.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                      {paginatedPhoneNumbers.map((phone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-secondary-500" />
                            <span className="text-sm text-secondary-700">{phone}</span>
                          </div>
                          <button
                            onClick={() => handleRemovePhoneNumber(index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPhonePages > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t border-secondary-200">
                        <div className="text-xs text-secondary-600">
                          Page {phoneNumberPage} of {totalPhonePages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPhoneNumberPage(prev => Math.max(1, prev - 1))}
                            disabled={phoneNumberPage === 1}
                            className="px-3 py-1 text-xs rounded border disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPhoneNumberPage(prev => Math.min(totalPhonePages, prev + 1))}
                            disabled={phoneNumberPage === totalPhonePages}
                            className="px-3 py-1 text-xs rounded border disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-secondary-500 text-center py-4">No phone numbers added</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button onClick={handleSavePhoneNumbers} disabled={updating} className="btn-primary flex-1">
                  {updating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
                </button>
                <button onClick={() => setPhoneModalOpen(false)} className="btn-secondary flex-1" disabled={updating}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDetails
