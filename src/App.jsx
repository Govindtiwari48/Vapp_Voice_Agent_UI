import { useState } from 'react'
import Dashboard from './components/Dashboard'
import CampaignList from './components/CampaignList'
import CallLogs from './components/CallLogs'
import CallDetails from './components/CallDetails'
import CreateCampaign from './components/CreateCampaign'
import { campaigns as initialCampaigns } from './data/dummyData'
import DashboardOverview from './components/DashboardOverview'
import ProjectTraining from './components/ProjectTraining'
import ApiDocs from './components/ApiDocs'
import WalletTopUp from './components/WalletTopUp'
import {
  LayoutGrid,
  GraduationCap,
  PhoneIncoming,
  PhoneOutgoing,
  PlugZap,
  Wallet,
  Phone
} from 'lucide-react'

function App() {
  const [view, setView] = useState('dashboardOverview') // dashboard, campaigns, callLogs, callDetails, createCampaign
  const [selectedCampaignType, setSelectedCampaignType] = useState(null) // incoming or outgoing
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [campaigns, setCampaigns] = useState(initialCampaigns)

  const handleSelectCampaignType = (type) => {
    setSelectedCampaignType(type)
    setView('campaigns')
  }

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign)
    setView('callLogs')
  }

  const handleSelectCall = (call) => {
    setSelectedCall(call)
    setView('callDetails')
  }

  const handleNavigateSection = (section) => {
    setView(section)
    setSelectedCampaignType(null)
    setSelectedCampaign(null)
    setSelectedCall(null)
  }

  const handleBack = () => {
    if (view === 'callDetails') {
      setView('callLogs')
      setSelectedCall(null)
    } else if (view === 'callLogs') {
      setView('campaigns')
      setSelectedCampaign(null)
    } else if (view === 'campaigns') {
      setView('dashboardOverview')
      setSelectedCampaignType(null)
    } else if (view === 'createCampaign') {
      setView('campaigns')
    } else if (['dashboardOverview', 'projectTraining', 'apiDocs', 'wallet'].includes(view)) {
      setView('dashboardOverview')
    }
  }

  const handleHome = () => {
    setView('dashboardOverview')
    setSelectedCampaignType(null)
    setSelectedCampaign(null)
    setSelectedCall(null)
  }

  const handleCreateCampaign = () => {
    setView('createCampaign')
  }

  const handleSaveCampaign = async (campaignData) => {
    // Generate a unique ID for the new campaign
    const campaignType = campaignData.campaignType
    const existingCampaigns = campaigns[campaignType] || []
    const newId = campaignType === 'incoming'
      ? `INC${String(existingCampaigns.length + 1).padStart(3, '0')}`
      : `OUT${String(existingCampaigns.length + 1).padStart(3, '0')}`

    // Create the new campaign object
    const newCampaign = {
      id: newId,
      name: campaignData.name,
      category: campaignData.category,
      description: campaignData.description,
      status: campaignData.status,
      totalCalls: 0,
      successfulCalls: 0,
      avgDuration: '0:00',
      createdDate: new Date().toISOString().split('T')[0],
      callLogs: [],
      // Store additional configuration
      config: {
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        timeZone: campaignData.timeZone,
        maxCallsPerDay: campaignData.maxCallsPerDay,
        callSchedule: campaignData.callSchedule,
        voiceAgentSettings: campaignData.voiceAgentSettings,
        leadQualification: campaignData.leadQualification,
        integrationSettings: campaignData.integrationSettings
      }
    }

    // Update campaigns state
    setCampaigns(prev => ({
      ...prev,
      [campaignType]: [...prev[campaignType], newCampaign]
    }))

    // Navigate back to campaigns list
    setView('campaigns')
  }

  const handleToggleCampaignStatus = (campaignId, newStatus) => {
    setCampaigns(prev => ({
      ...prev,
      [selectedCampaignType]: prev[selectedCampaignType].map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: newStatus }
          : campaign
      )
    }))
  }

  const navigationItems = [
    // {
    //   id: 'dashboard',
    //   label: 'Dashboard',
    //   icon: LayoutGrid,
    //   action: () => {
    //     setView('dashboard')
    //     setSelectedCampaignType(null)
    //     setSelectedCampaign(null)
    //     setSelectedCall(null)
    //   }
    // },
    {
      id: 'dashboardOverview',
      label: 'Dashboard Overview',
      icon: LayoutGrid,
      action: () => handleNavigateSection('dashboardOverview')
    },
    {
      id: 'projectTraining',
      label: 'Project Training',
      icon: GraduationCap,
      action: () => handleNavigateSection('projectTraining')
    },
    {
      id: 'inbound',
      label: 'Inbound Campaigns',
      icon: PhoneIncoming,
      action: () => handleSelectCampaignType('incoming')
    },
    {
      id: 'outbound',
      label: 'Outbound Campaigns',
      icon: PhoneOutgoing,
      action: () => handleSelectCampaignType('outgoing')
    },
    {
      id: 'apiDocs',
      label: 'API Docs',
      icon: PlugZap,
      action: () => handleNavigateSection('apiDocs')
    },
    {
      id: 'wallet',
      label: 'Wallet Top-Up',
      icon: Wallet,
      action: () => handleNavigateSection('wallet')
    }
  ]

  const getActiveNavId = () => {
    if (view === 'dashboard') return 'dashboard'
    if (view === 'dashboardOverview') return 'dashboardOverview'
    if (view === 'projectTraining') return 'projectTraining'
    if (view === 'apiDocs') return 'apiDocs'
    if (view === 'wallet') return 'wallet'
    if (view === 'campaigns' && selectedCampaignType === 'incoming') return 'inbound'
    if (view === 'campaigns' && selectedCampaignType === 'outgoing') return 'outbound'
    if (view === 'callLogs' && selectedCampaignType === 'incoming') return 'inbound'
    if (view === 'callLogs' && selectedCampaignType === 'outgoing') return 'outbound'
    if (view === 'callDetails' && selectedCampaignType === 'incoming') return 'inbound'
    if (view === 'callDetails' && selectedCampaignType === 'outgoing') return 'outbound'
    if (view === 'createCampaign' && selectedCampaignType === 'incoming') return 'inbound'
    if (view === 'createCampaign' && selectedCampaignType === 'outgoing') return 'outbound'
    return null
  }

  const activeNavId = getActiveNavId()

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-secondary-200 flex-shrink-0 fixed h-screen overflow-y-auto z-20">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2.5 rounded-lg flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-secondary-900">Voice Agent</h1>
              <p className="text-xs text-secondary-500">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNavId === item.id
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-secondary-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">
        {view === 'dashboard' && (
          <Dashboard onSelectType={handleSelectCampaignType} onNavigateSection={handleNavigateSection} />
        )}

        {view === 'dashboardOverview' && (
          <DashboardOverview onBack={handleBack} onHome={handleHome} />
        )}

        {view === 'projectTraining' && (
          <ProjectTraining onBack={handleBack} onHome={handleHome} />
        )}

        {view === 'apiDocs' && (
          <ApiDocs onBack={handleBack} onHome={handleHome} />
        )}

        {view === 'wallet' && (
          <WalletTopUp onBack={handleBack} onHome={handleHome} />
        )}

        {view === 'campaigns' && (
          <CampaignList
            type={selectedCampaignType}
            campaigns={campaigns[selectedCampaignType]}
            onSelectCampaign={handleSelectCampaign}
            onBack={handleBack}
            onHome={handleHome}
            onCreateCampaign={handleCreateCampaign}
            onToggleCampaignStatus={handleToggleCampaignStatus}
          />
        )}

        {view === 'createCampaign' && (
          <CreateCampaign
            type={selectedCampaignType}
            onBack={handleBack}
            onHome={handleHome}
            onSave={handleSaveCampaign}
          />
        )}

        {view === 'callLogs' && (
          <CallLogs
            campaign={selectedCampaign}
            type={selectedCampaignType}
            onSelectCall={handleSelectCall}
            onBack={handleBack}
            onHome={handleHome}
          />
        )}

        {view === 'callDetails' && (
          <CallDetails
            call={selectedCall}
            campaign={selectedCampaign}
            type={selectedCampaignType}
            onBack={handleBack}
            onHome={handleHome}
          />
        )}
      </main>
    </div>
  )
}

export default App

