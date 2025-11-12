import { useState } from 'react'
import Dashboard from './components/Dashboard'
import CampaignList from './components/CampaignList'
import CallLogs from './components/CallLogs'
import CallDetails from './components/CallDetails'
import { campaigns } from './data/dummyData'

function App() {
  const [view, setView] = useState('dashboard') // dashboard, campaigns, callLogs, callDetails
  const [selectedCampaignType, setSelectedCampaignType] = useState(null) // incoming or outgoing
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)

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
    }
  }

  const handleHome = () => {
    setView('dashboard')
    setSelectedCampaignType(null)
    setSelectedCampaign(null)
    setSelectedCall(null)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {view === 'dashboard' && (
        <Dashboard onSelectType={handleSelectCampaignType} />
      )}
      
      {view === 'campaigns' && (
        <CampaignList
          type={selectedCampaignType}
          campaigns={campaigns[selectedCampaignType]}
          onSelectCampaign={handleSelectCampaign}
          onBack={handleBack}
          onHome={handleHome}
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

