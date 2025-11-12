import { ArrowLeft, Home, Phone, Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react'

const CallLogs = ({ campaign, type, onSelectCall, onBack, onHome }) => {
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
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-secondary-900">{campaign.name}</h1>
                  {campaign.status === 'active' ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Paused</span>
                  )}
                </div>
                <p className="text-xs text-secondary-500 mt-0.5">
                  {campaign.id} • {campaign.callLogs.length} calls
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Total Calls</p>
            <p className="text-2xl font-bold text-secondary-900">{campaign.totalCalls}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-600">{campaign.successfulCalls}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Avg Duration</p>
            <p className="text-2xl font-bold text-secondary-900">{campaign.avgDuration}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-secondary-500 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((campaign.successfulCalls / campaign.totalCalls) * 100)}%
            </p>
          </div>
        </div>

        {/* Call Logs Table */}
        <div className="card">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h2 className="text-base font-semibold text-secondary-900">Call Logs</h2>
            <p className="text-xs text-secondary-500 mt-0.5">Click on any call to view details</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Call ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {campaign.callLogs.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call)}
                    className="hover:bg-secondary-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(call.status)}
                        <span className="text-sm font-medium text-secondary-900">{call.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-900">{call.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{call.date}</div>
                      <div className="text-xs text-secondary-500">{call.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm text-secondary-900">{call.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getQualificationBadge(call.leadQualification)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-900">
                        {call.keywords?.location || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallLogs

