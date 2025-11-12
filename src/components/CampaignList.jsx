import { ArrowLeft, Home, PhoneIncoming, PhoneOutgoing, Phone, Clock, CheckCircle, TrendingUp } from 'lucide-react'

const CampaignList = ({ type, campaigns, onSelectCampaign, onBack, onHome }) => {
  const isIncoming = type === 'incoming'

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isIncoming ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isIncoming ? (
                    <PhoneIncoming className={`w-5 h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  ) : (
                    <PhoneOutgoing className={`w-5 h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-secondary-900">
                    {isIncoming ? 'Incoming' : 'Outgoing'} Campaigns
                  </h1>
                  <p className="text-xs text-secondary-500">{campaigns.length} campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => {
            const successRate = Math.round((campaign.successfulCalls / campaign.totalCalls) * 100)
            
            return (
              <div
                key={campaign.id}
                onClick={() => onSelectCampaign(campaign)}
                className="card p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-semibold text-secondary-900">{campaign.name}</h3>
                      {campaign.status === 'active' ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-warning">Paused</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-secondary-500">
                      <span>ID: {campaign.id}</span>
                      <span>•</span>
                      <span>Created: {campaign.createdDate}</span>
                      <span>•</span>
                      <span>{campaign.callLogs.length} recent calls</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4 text-secondary-400" />
                      <p className="text-xs text-secondary-500">Total Calls</p>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{campaign.totalCalls}</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-xs text-secondary-500">Successful</p>
                    </div>
                    <p className="text-lg font-semibold text-green-600">{campaign.successfulCalls}</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <p className="text-xs text-secondary-500">Success Rate</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">{successRate}%</p>
                  </div>

                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <p className="text-xs text-secondary-500">Avg Duration</p>
                    </div>
                    <p className="text-lg font-semibold text-purple-600">{campaign.avgDuration}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CampaignList

