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
  Phone,
  Menu,
  X
} from 'lucide-react'

function App() {
  const [view, setView] = useState('dashboardOverview') // dashboard, campaigns, callLogs, callDetails, createCampaign
  const [selectedCampaignType, setSelectedCampaignType] = useState(null) // incoming or outgoing
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSelectCampaignType = (type) => {
    setSelectedCampaignType(type)
    setView('campaigns')
    setIsMobileMenuOpen(false)
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
    setIsMobileMenuOpen(false)
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
    console.log('=== HANDLE SAVE CAMPAIGN CALLED ===')
    console.log('Campaign Data Received:', campaignData)
    
    // Generate a unique ID for the new campaign
    const campaignType = campaignData.campaignType
    console.log('Campaign Type:', campaignType)
    const existingCampaigns = campaigns[campaignType] || []
    console.log('Existing Campaigns Count:', existingCampaigns.length)
    const newId = campaignType === 'incoming'
      ? `INC${String(existingCampaigns.length + 1).padStart(3, '0')}`
      : `OUT${String(existingCampaigns.length + 1).padStart(3, '0')}`
    console.log('New Campaign ID:', newId)

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
        integrationSettings: campaignData.integrationSettings,
        phoneNumbers: campaignData.phoneNumbers || [] // Store phone numbers
      }
    }

    console.log('New Campaign Object:', newCampaign)
    console.log('Phone Numbers in Campaign:', newCampaign.config.phoneNumbers)

    // Update campaigns state
    setCampaigns(prev => {
      const updated = {
        ...prev,
        [campaignType]: [...prev[campaignType], newCampaign]
      }
      console.log('Updated Campaigns State:', updated)
      return updated
    })

    console.log('Campaign saved successfully, navigating to campaigns list')
    // Navigate back to campaigns list
    setView('campaigns')
    console.log('=== HANDLE SAVE CAMPAIGN COMPLETED ===')
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
      action: () => {
        handleNavigateSection('dashboardOverview')
        setIsMobileMenuOpen(false)
      }
    },
    {
      id: 'projectTraining',
      label: 'Project Training',
      icon: GraduationCap,
      action: () => {
        handleNavigateSection('projectTraining')
        setIsMobileMenuOpen(false)
      }
    },
    {
      id: 'inbound',
      label: 'Inbound Campaigns',
      icon: PhoneIncoming,
      action: () => {
        handleSelectCampaignType('incoming')
        setIsMobileMenuOpen(false)
      }
    },
    {
      id: 'outbound',
      label: 'Outbound Campaigns',
      icon: PhoneOutgoing,
      action: () => {
        handleSelectCampaignType('outgoing')
        setIsMobileMenuOpen(false)
      }
    },
    {
      id: 'apiDocs',
      label: 'API Docs',
      icon: PlugZap,
      action: () => {
        handleNavigateSection('apiDocs')
        setIsMobileMenuOpen(false)
      }
    },
    {
      id: 'wallet',
      label: 'Wallet Top-Up',
      icon: Wallet,
      action: () => {
        handleNavigateSection('wallet')
        setIsMobileMenuOpen(false)
      }
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white rounded-lg shadow-md border border-secondary-200 hover:bg-secondary-50 active:bg-secondary-100 transition-colors touch-manipulation"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-secondary-700" />
        ) : (
          <Menu className="w-6 h-6 text-secondary-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`w-64 bg-white border-r border-secondary-200 flex-shrink-0 fixed h-screen overflow-y-auto z-20 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="p-4 sm:p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2.5 rounded-lg flex-shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-secondary-900">Voice Agent</h1>
              <p className="text-xs text-secondary-500">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-3 sm:p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNavId === item.id
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 relative touch-manipulation ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r"></div>
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-secondary-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen w-full pt-16 lg:pt-0">
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

