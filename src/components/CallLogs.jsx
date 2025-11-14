import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Home,
  IndianRupee,
  Phone,
  XCircle
} from 'lucide-react'

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
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
                  {campaign.id} • {campaign.callLogs.length} calls
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
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary-500">Allocated DID Number</p>
              <p className="text-xl font-semibold text-secondary-900">{campaign.allocatedDid || 'Not assigned'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                    activeFilter === filter.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-secondary-200 text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button className="btn-secondary inline-flex items-center space-x-2 text-sm">
              <Download className="w-4 h-4" />
              <span>Download XLSX</span>
            </button>
          </div>
        </div>

        {/* Call Logs - Desktop Table View */}
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
                {campaign.callLogs.map((call) => (
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

        {/* Call Logs - Mobile Card View */}
        <div className="md:hidden space-y-3">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-secondary-900">Call Detail Record</h2>
            <p className="text-xs text-secondary-500 mt-0.5">Tap on any call to view details</p>
          </div>
          {campaign.callLogs.map((call) => (
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
      </div>
    </div>
  )
}

export default CallLogs

