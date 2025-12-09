import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  Home,
  Home as HomeIcon,
  MapPin,
  Bed,
  MessageSquare,
  Phone,
  Play,
  Tag,
  TrendingUp
} from 'lucide-react'

const CallDetails = ({ call, campaign, type, onBack, onHome }) => {
  // Helper function to display value or NA (but show 0 if value is 0)
  const displayValue = (value) => {
    if (value === 0 || value === '0') return '0'
    if (value === null || value === undefined || value === '') return 'NA'
    return value
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'no-answer':
        return 'text-red-600 bg-red-50'
      case 'busy':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-secondary-600 bg-secondary-50'
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'neutral':
        return 'text-blue-600 bg-blue-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-secondary-600 bg-secondary-50'
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
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                title="Back to Call Logs"
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
                <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">Call Details</h1>
                <p className="text-xs text-secondary-500 mt-0.5 truncate">
                  {displayValue(campaign?.name)} • {displayValue(call?.id || call?._id)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Call Overview */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-base font-semibold text-secondary-900 mb-3 sm:mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0" />
                Call Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Phone Number</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-secondary-900 break-all">{displayValue(call?.phoneNumber || call?.cnum)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Date & Time</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <p className="text-sm text-secondary-900 break-words">
                        {call?.date && call?.time ? `${call.date} at ${call.time}` : (displayValue(call?.date || call?.time || call?.start))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Duration</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-secondary-900">{displayValue(call?.duration)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Status</p>
                    {call.status ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" /> : <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />}
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-secondary-600">NA</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-xs text-secondary-500 mb-2">Voice Recording</p>
                {call?.recordingUrl ? (
                  <div className="flex items-center space-x-3 bg-secondary-50 p-3 rounded-lg">
                    <button className="p-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                      <Play className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1">
                      <div className="h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 w-0" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <span className="text-xs text-secondary-500">{displayValue(call?.duration)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-secondary-600">NA</p>
                )}
              </div>
            </div>

            {/* Lead Keywords & Qualification */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-base font-semibold text-secondary-900 mb-3 sm:mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0" />
                Lead Information & Keywords
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Budget</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.budget)}</p>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Location</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.location)}</p>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bed className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Bedrooms</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.bedrooms)}</p>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <HomeIcon className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Property Type</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.propertyType)}</p>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Move-in Date</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.moveInDate)}</p>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">Intent Level</p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900">{displayValue(call?.keywords?.intent)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-xs font-medium text-secondary-500 uppercase mb-2">Amenities Mentioned</p>
                <p className="text-sm text-secondary-900">{displayValue(call?.keywords?.amenities)}</p>
              </div>
            </div>

            {/* Transcript & Summary */}
            <div className="card p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-secondary-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0" />
                  Call Transcript
                </h2>
                {call?.transcript ? (
                  <div className="flex flex-wrap gap-2">
                    {call?.transcriptPdfUrl ? (
                      <a
                        href={call.transcriptPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-flex items-center space-x-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Transcript (PDF)</span>
                      </a>
                    ) : (
                      <button type="button" className="btn-secondary text-sm opacity-50 cursor-not-allowed">
                        Download Transcript (PDF)
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary text-sm opacity-50 cursor-not-allowed">
                      Download Transcript (PDF) - NA
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-secondary-50 p-3 sm:p-4 rounded-lg lg:col-span-2 overflow-x-auto">
                  <pre className="text-xs sm:text-sm text-secondary-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {displayValue(call?.transcript)}
                  </pre>
                </div>
                <div className="bg-white border border-secondary-200 rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-secondary-900">Conversation Summary</h3>
                    <MessageSquare className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-xs text-secondary-500">High-level context for the team</p>
                  <p className="text-sm text-secondary-800 leading-relaxed">
                    {displayValue(call?.transcriptionSummary)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Lead Qualification */}
            <div className="card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                Lead Qualification
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Type</p>
                  {call.leadQualification === 'show-project' ? (
                    <span className="badge badge-info">Show Project</span>
                  ) : call.leadQualification === 'callback' ? (
                    <span className="badge badge-warning">Arrange Callback</span>
                  ) : call.leadQualification ? (
                    <span className="badge">Not Qualified</span>
                  ) : (
                    <span className="text-sm text-secondary-600">NA</span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-secondary-500 mb-1">Sentiment</p>
                  {call.sentiment ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSentimentColor(call.sentiment)}`}>
                      {call.sentiment.charAt(0).toUpperCase() + call.sentiment.slice(1)}
                    </span>
                  ) : (
                    <span className="text-sm text-secondary-600">NA</span>
                  )}
                </div>
              </div>
            </div>

            {/* Next Action */}
            <div className="card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                Next Action
              </h3>
              <p className="text-xs sm:text-sm text-secondary-700 leading-relaxed break-words">{displayValue(call?.nextAction || call?.recommendedAction)}</p>
            </div>

            {/* Campaign Info */}
            <div className="card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-secondary-900 mb-3">Campaign</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-secondary-500">Name</p>
                  <p className="text-sm text-secondary-900 font-medium break-words">{displayValue(campaign?.name)}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">ID</p>
                  <p className="text-sm text-secondary-900 break-all">{displayValue(campaign?.id || campaign?._id)}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Type</p>
                  <p className="text-sm text-secondary-900 capitalize">{displayValue(type)}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-secondary-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary-500">Call Duration</span>
                  <span className="text-sm font-medium text-secondary-900">{displayValue(call?.duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary-500">Campaign Avg</span>
                  <span className="text-sm font-medium text-secondary-900">{displayValue(campaign?.avgDuration)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-secondary-200">
                  <span className="text-xs text-secondary-500">Performance</span>
                  {call?.duration && campaign?.avgDuration && call.duration !== 'NA' && campaign.avgDuration !== 'NA' ? (
                    call.duration > campaign.avgDuration ? (
                      <span className="text-xs font-medium text-green-600">Above Average</span>
                    ) : (
                      <span className="text-xs font-medium text-blue-600">Below Average</span>
                    )
                  ) : (
                    <span className="text-xs text-secondary-600">NA</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallDetails

