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
  {
    method: 'POST',
    path: '/v1/webhooks/inbound',
    description: 'Send completed inbound call payloads',
    auth: 'HMAC + API Key'
  },
  {
    method: 'POST',
    path: '/v1/webhooks/outbound',
    description: 'Receive outbound disposition + spend',
    auth: 'HMAC + API Key'
  },
  {
    method: 'GET',
    path: '/v1/campaigns/:id/calls',
    description: 'Fetch call level metrics with pagination',
    auth: 'Bearer Token'
  },
  {
    method: 'POST',
    path: '/v1/campaigns/:id/calls',
    description: 'Inject new leads for dialer',
    auth: 'Bearer Token'
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-600" />
          </button>
          <button
            onClick={onHome}
            className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors"
            aria-label="Home"
          >
            <Home className="w-5 h-5 text-secondary-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Section</p>
            <h1 className="text-xl font-semibold text-secondary-900">API & Webhooks</h1>
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
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  activeTab === tab.key
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-secondary-500 uppercase tracking-wide border-b border-secondary-200">
                  <th className="py-3 pr-4">Method</th>
                  <th className="py-3 pr-4">Path</th>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 text-sm text-secondary-700">
                {endpoints.map((row) => (
                  <tr key={row.path}>
                    <td className="py-3 pr-4 font-mono text-xs">
                      <span
                        className={`px-2 py-1 rounded-md ${
                          row.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-secondary-900">{row.path}</td>
                    <td className="py-3 pr-4">{row.description}</td>
                    <td className="py-3 text-secondary-500">{row.auth}</td>
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

export default ApiDocs


