import { ArrowLeft, Home, PhoneIncoming, PhoneOutgoing, Calendar, Clock, Target, TrendingUp, Phone, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const CampaignDetails = ({ campaign, onBack, onHome }) => {
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

  const successRate = metrics.totalCalls > 0
    ? Math.round((metrics.successfulCalls / metrics.totalCalls) * 100)
    : 0

  const callsByStatus = metrics.callsByStatus || {}

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
            <p className="text-2xl font-bold text-secondary-900">{metrics.totalCalls || 0}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Successful Calls</p>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.successfulCalls || 0}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Success Rate</p>
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-primary-600">{successRate}%</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Avg Duration</p>
              <Clock className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{formatDuration(metrics.avgDuration)}</p>
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
                  <p className="text-sm font-medium text-secondary-900">{campaign.name}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-secondary-900">{campaign.category}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Description</p>
                  <p className="text-sm text-secondary-700">{campaign.description}</p>
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
            {!isInbound && campaign.phoneNumbers && campaign.phoneNumbers.length > 0 && (
              <div className="card p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Phone Numbers</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {campaign.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-secondary-50 rounded">
                      <Phone className="w-4 h-4 text-secondary-500" />
                      <span className="text-sm text-secondary-700">{phone}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-secondary-500 mt-3">Total: {campaign.phoneNumbers.length} phone numbers</p>
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
                  <p className="text-2xl font-bold text-secondary-900">{metrics.totalCalls || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Successful Calls</p>
                  <p className="text-xl font-semibold text-green-600">{metrics.successfulCalls || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Failed Calls</p>
                  <p className="text-xl font-semibold text-red-600">{metrics.failedCalls || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-primary-600">{successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                  <p className="text-lg font-semibold text-secondary-900">{formatDuration(metrics.avgDuration)}</p>
                </div>
                {metrics.conversionRate !== undefined && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Conversion Rate</p>
                    <p className="text-lg font-semibold text-secondary-900">{metrics.conversionRate || 0}%</p>
                  </div>
                )}
                {metrics.costPerCall !== undefined && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Cost Per Call</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metrics.costPerCall || 0}</p>
                  </div>
                )}
                {metrics.revenue !== undefined && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-secondary-900">₹ {metrics.revenue || 0}</p>
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
                          {count || 0}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails
