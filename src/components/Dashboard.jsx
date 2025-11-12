import { PhoneIncoming, PhoneOutgoing, TrendingUp, Clock, Phone, CheckCircle } from 'lucide-react'
import { campaigns } from '../data/dummyData'

const Dashboard = ({ onSelectType }) => {
  const incomingStats = {
    totalCampaigns: campaigns.incoming.length,
    totalCalls: campaigns.incoming.reduce((sum, c) => sum + c.totalCalls, 0),
    successfulCalls: campaigns.incoming.reduce((sum, c) => sum + c.successfulCalls, 0),
    avgDuration: '4:12'
  }

  const outgoingStats = {
    totalCampaigns: campaigns.outgoing.length,
    totalCalls: campaigns.outgoing.reduce((sum, c) => sum + c.totalCalls, 0),
    successfulCalls: campaigns.outgoing.reduce((sum, c) => sum + c.successfulCalls, 0),
    avgDuration: '2:58'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2.5 rounded-lg">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900">Voice Agent Panel</h1>
              <p className="text-xs text-secondary-500 mt-0.5">Campaign Management & Analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Total Campaigns</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">
                  {incomingStats.totalCampaigns + outgoingStats.totalCampaigns}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Total Calls</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">
                  {incomingStats.totalCalls + outgoingStats.totalCalls}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Successful</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">
                  {incomingStats.successfulCalls + outgoingStats.successfulCalls}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Avg Duration</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">3:35</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Type Selection */}
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Select Campaign Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incoming Campaigns */}
            <div
              onClick={() => onSelectType('incoming')}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <PhoneIncoming className="w-7 h-7 text-green-600" />
                </div>
                <span className="badge badge-success">{incomingStats.totalCampaigns} Active</span>
              </div>
              
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Incoming Campaigns</h3>
              <p className="text-sm text-secondary-600 mb-5">
                Manage and track incoming customer inquiries and interactions
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-secondary-100">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Total Calls</p>
                  <p className="text-lg font-semibold text-secondary-900">{incomingStats.totalCalls}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Math.round((incomingStats.successfulCalls / incomingStats.totalCalls) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                  <p className="text-lg font-semibold text-secondary-900">{incomingStats.avgDuration}</p>
                </div>
              </div>
            </div>

            {/* Outgoing Campaigns */}
            <div
              onClick={() => onSelectType('outgoing')}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <PhoneOutgoing className="w-7 h-7 text-blue-600" />
                </div>
                <span className="badge badge-info">{outgoingStats.totalCampaigns} Active</span>
              </div>
              
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Outgoing Campaigns</h3>
              <p className="text-sm text-secondary-600 mb-5">
                Track outbound calls, follow-ups and customer outreach efforts
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-secondary-100">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Total Calls</p>
                  <p className="text-lg font-semibold text-secondary-900">{outgoingStats.totalCalls}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Success Rate</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {Math.round((outgoingStats.successfulCalls / outgoingStats.totalCalls) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Avg Duration</p>
                  <p className="text-lg font-semibold text-secondary-900">{outgoingStats.avgDuration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

