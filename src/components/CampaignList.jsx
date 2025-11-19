import { ArrowLeft, Home, PhoneIncoming, PhoneOutgoing, Phone, Clock, CheckCircle, TrendingUp, Plus, Pause, Play } from 'lucide-react'

const CampaignList = ({ type, campaigns, onSelectCampaign, onBack, onHome, onCreateCampaign, onToggleCampaignStatus }) => {
  const isIncoming = type === 'incoming'

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
                <div className={`p-2 rounded-lg flex-shrink-0 ${isIncoming ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isIncoming ? (
                    <PhoneIncoming className={`w-4 h-4 sm:w-5 sm:h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  ) : (
                    <PhoneOutgoing className={`w-4 h-4 sm:w-5 sm:h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">
                    {isIncoming ? 'Incoming' : 'Outgoing'} Campaigns
                  </h1>
                  <p className="text-xs text-secondary-500">{campaigns.length} campaigns</p>
                </div>
              </div>
            </div>
            <button
              onClick={onCreateCampaign}
              className="btn-primary flex items-center space-x-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Campaign</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {campaigns.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-secondary-600 mb-4">No campaigns found. Create your first campaign to get started.</p>
            <button
              onClick={onCreateCampaign}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {campaigns.map((campaign) => {
            const successRate = Math.round((campaign.successfulCalls / campaign.totalCalls) * 100)
            
            return (
              <div
                key={campaign.id}
                className="card p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectCampaign(campaign)}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-secondary-900 truncate flex-1 min-w-0">{campaign.name}</h3>
                      {campaign.status === 'active' ? (
                        <span className="badge badge-success flex-shrink-0">Active</span>
                      ) : (
                        <span className="badge badge-warning flex-shrink-0">Paused</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary-500">
                      <span className="truncate">ID: {campaign.id}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">Created: {campaign.createdDate}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{campaign.callLogs.length} calls</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleCampaignStatus(campaign.id, campaign.status === 'active' ? 'paused' : 'active')
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === 'active'
                          ? 'hover:bg-yellow-100 text-yellow-600'
                          : 'hover:bg-green-100 text-green-600'
                      }`}
                      title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                      aria-label={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div 
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 cursor-pointer"
                  onClick={() => onSelectCampaign(campaign)}
                >
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <p className="text-xs text-secondary-500 truncate">Total Calls</p>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-secondary-900">{campaign.totalCalls}</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="text-xs text-secondary-500 truncate">Successful</p>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-green-600">{campaign.successfulCalls}</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="text-xs text-secondary-500 truncate">Success Rate</p>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-blue-600">{successRate}%</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <p className="text-xs text-secondary-500 truncate">Avg Duration</p>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-purple-600">{campaign.avgDuration}</p>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignList

