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

function App() {
  const [view, setView] = useState('dashboard') // dashboard, campaigns, callLogs, callDetails, createCampaign
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
      setView('dashboard')
      setSelectedCampaignType(null)
    } else if (view === 'createCampaign') {
      setView('campaigns')
    } else if (['dashboardOverview', 'projectTraining', 'apiDocs', 'wallet'].includes(view)) {
      setView('dashboard')
    }
  }

  const handleHome = () => {
    setView('dashboard')
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

  return (
    <div className="min-h-screen bg-secondary-50">
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
    </div>
  )
}

export default App

