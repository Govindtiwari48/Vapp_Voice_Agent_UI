import {
  ArrowRight,
  GraduationCap,
  LayoutGrid,
  PhoneIncoming,
  PhoneOutgoing,
  PlugZap,
  Upload,
  Wallet
} from 'lucide-react'

const Dashboard = ({ onSelectType, onNavigateSection }) => {
  const sections = [
    {
      title: 'Dashboard',
      description: 'Bird’s-eye view to monitor spend, usage and performance.',
      icon: LayoutGrid,
      cta: 'View Overview',
      action: () => onNavigateSection?.('dashboardOverview')
    },
    {
      title: 'Project Training',
      description: 'Paste links, upload PDFs and define inbound/outbound flows.',
      icon: GraduationCap,
      cta: 'Configure Project',
      action: () => onNavigateSection?.('projectTraining')
    },
    {
      title: 'Inbound Campaigns',
      description: 'Activate IVR numbers and monitor the calls dashboard.',
      icon: PhoneIncoming,
      cta: 'Open Inbound',
      action: () => onSelectType('incoming')
    },
    {
      title: 'Outbound Campaigns',
      description: 'Upload datasets and jump into dialer dashboards.',
      icon: PhoneOutgoing,
      cta: 'Open Outbound',
      action: () => onSelectType('outgoing')
    },
    {
      title: 'API',
      description: 'Patch APIs and webhooks to sync data with other CRMs.',
      icon: PlugZap,
      cta: 'View API Docs',
      action: () => onNavigateSection?.('apiDocs')
    },
    {
      title: 'Add Call Credits',
      description: 'Top-up wallet balance so the AI agent never pauses.',
      icon: Wallet,
      cta: 'Add Credits',
      action: () => onNavigateSection?.('wallet')
    }
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-secondary-900">Dashboard</h1>
            <p className="text-sm text-secondary-500 mt-1">Unified workflow for dashboard, training and campaigns</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map(section => (
            <div key={section.title} className="card p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-secondary-100 p-2 rounded-lg">
                    <section.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-secondary-500 tracking-wide">Section</p>
                    <h3 className="text-lg font-semibold text-secondary-900">{section.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-secondary-600">{section.description}</p>
              </div>
              <button
                type="button"
                onClick={section.action}
                disabled={!section.action}
                className="mt-6 inline-flex items-center justify-between text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:text-secondary-300"
              >
                <span>{section.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Dashboard

