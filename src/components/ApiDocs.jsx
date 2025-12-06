import { useState } from 'react'
import { ArrowLeft, Home, ServerCog, Code, Copy, Check, Shield, Globe, Webhook } from 'lucide-react'

const tabConfig = [
  {
    key: 'inbound',
    title: 'Inbound Webhooks',
    description: 'Push transcripts, call summaries & tags to your CRM in near real-time.'
  },
  {
    key: 'outbound',
    title: 'Outbound Sync',
    description: 'Trigger automated dials from your data warehouse, Sheets or CRM.'
  },
  {
    key: 'events',
    title: 'Event Stream',
    description: 'Subscribe to lifecycle events for monitoring and BI pipelines.'
  }
]

const endpoints = [
  // Health & System
  {
    method: 'GET',
    path: '/health',
    description: 'Health check endpoint',
    auth: 'None',
    category: 'System'
  },
  {
    method: 'GET',
    path: '/public-url',
    description: 'Get public URL information',
    auth: 'None',
    category: 'System'
  },
  {
    method: 'GET',
    path: '/tools',
    description: 'List available tools',
    auth: 'None',
    category: 'System'
  },
  {
    method: 'GET',
    path: '/twiml',
    description: 'Get TwiML template',
    auth: 'None',
    category: 'System'
  },
  // Authentication
  {
    method: 'POST',
    path: '/auth/signup',
    description: 'Register a new user account',
    auth: 'None',
    category: 'Authentication'
  },
  {
    method: 'POST',
    path: '/auth/login',
    description: 'Login and get JWT token',
    auth: 'None',
    category: 'Authentication'
  },
  // Call Management
  {
    method: 'GET',
    path: '/api/calls',
    description: 'Get all calls with pagination and filters (date, status)',
    auth: 'Bearer Token',
    category: 'Calls'
  },
  // Dashboard Analytics
  {
    method: 'GET',
    path: '/api/dashboard/overview',
    description: 'Get dashboard overview metrics (weekly, monthly, total, custom)',
    auth: 'Bearer Token',
    category: 'Dashboard'
  },
  {
    method: 'GET',
    path: '/api/dashboard/metrics',
    description: 'Get detailed dashboard metrics with breakdowns',
    auth: 'Bearer Token',
    category: 'Dashboard'
  },
  {
    method: 'POST',
    path: '/api/dashboard/export',
    description: 'Export dashboard data to Excel (.xlsx)',
    auth: 'Bearer Token',
    category: 'Dashboard'
  },
  // Webhooks
  {
    method: 'POST',
    path: '/webhook',
    description: 'Receive webhook data (Twilio call events)',
    auth: 'None',
    category: 'Webhooks'
  },
  {
    method: 'GET',
    path: '/webhook',
    description: 'Generic webhook endpoint for testing',
    auth: 'None',
    category: 'Webhooks'
  }
]

const ApiDocs = ({ onBack, onHome }) => {
  const [activeTab, setActiveTab] = useState('inbound')
  const [copied, setCopied] = useState(false)
  const apiKey = 'sk_live_xxxxx-voice-agent'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0"
                aria-label="Home"
              >
                <Home className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-secondary-500">Section</p>
                <h1 className="text-xl font-semibold text-secondary-900">API & Webhooks</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 space-y-2">
            <ServerCog className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-secondary-900">Authentication</h3>
            <p className="text-xs text-secondary-500">
              Rotate API keys anytime and lock down via IP allow-listing.
            </p>
            <div className="bg-secondary-50 rounded-lg p-3 flex items-center justify-between">
              <span className="font-mono text-xs text-secondary-700 truncate">{apiKey}</span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-md bg-white border border-secondary-200 hover:border-primary-300 transition-colors"
                aria-label="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-secondary-500" />}
              </button>
            </div>
          </div>
          <div className="card p-4 space-y-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-secondary-900">Security</h3>
            <p className="text-xs text-secondary-500">
              Every payload is signed with SHA-256 HMAC & timestamp for replay protection.
            </p>
          </div>
          <div className="card p-4 space-y-2">
            <Globe className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-secondary-900">Regions</h3>
            <p className="text-xs text-secondary-500">
              Host in Mumbai, Singapore or Oregon. Latency optimized routing for APAC.
            </p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:text-secondary-900'
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <p className="text-sm text-secondary-600">{tabConfig.find((tab) => tab.key === activeTab)?.description}</p>
          <div className="bg-secondary-50 rounded-lg border border-dashed border-secondary-200 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-secondary-600">
              <Code className="w-4 h-4 text-primary-600" />
              <span>curl --request POST https://api.voice-agent.ai/v1/webhooks/{activeTab}</span>
            </div>
            <pre className="text-xs text-secondary-700 whitespace-pre-wrap font-mono">
              {`{
  "call_id": "CALL001",
  "campaign_id": "INC001",
  "disposition": "Successful",
  "spend_inr": 7.26,
  "transcription_url": "https://files.voice-agent.ai/call001.pdf"
}`}
            </pre>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary-500">REST Endpoints</p>
              <h3 className="text-lg font-semibold text-secondary-900">Campaign & Call APIs</h3>
            </div>
            <Webhook className="w-5 h-5 text-primary-600" />
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead>
                    <tr className="text-left text-xs text-secondary-500 uppercase tracking-wide border-b border-secondary-200">
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Path</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Description</th>
                      <th className="py-3 px-4 hidden md:table-cell">Category</th>
                      <th className="py-3 px-4 hidden lg:table-cell">Auth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 text-sm text-secondary-700">
                    {endpoints.map((row, index) => (
                      <tr key={`${row.path}-${index}`} className="hover:bg-secondary-50">
                        <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-md ${row.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}
                          >
                            {row.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-secondary-900 break-all">{row.path}</td>
                        <td className="py-3 px-4 hidden sm:table-cell">{row.description}</td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="badge badge-info">{row.category}</span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell text-secondary-500">{row.auth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View for API Endpoints */}
          <div className="sm:hidden space-y-3 mt-4">
            {endpoints.map((row, index) => (
              <div key={`${row.path}-mobile-${index}`} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-mono ${row.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {row.method}
                  </span>
                  <span className="badge badge-info text-xs">{row.category}</span>
                </div>
                <p className="font-mono text-xs text-secondary-900 break-all">{row.path}</p>
                <p className="text-xs text-secondary-600">{row.description}</p>
                <p className="text-xs text-secondary-500">Auth: {row.auth}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDocs


