import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import CampaignList from './components/CampaignList'
import CallLogs from './components/CallLogs'
import CallDetails from './components/CallDetails'
import CreateCampaign from './components/CreateCampaign'
import DashboardOverview from './components/DashboardOverview'
import CampaignDetails from './components/CampaignDetails'
import ProjectTraining from './components/ProjectTraining'
import ApiDocs from './components/ApiDocs'
import WalletTopUp from './components/WalletTopUp'
import Login from './components/Login'
import SessionWarning from './components/SessionWarning'
import { isAuthenticated, getUser, clearAuth, updateLastActivity } from './api/auth'
import { getCampaignById } from './api'
import sessionManager from './utils/sessionManager'
import {
  LayoutGrid,
  GraduationCap,
  PhoneIncoming,
  PhoneOutgoing,
  PlugZap,
  Wallet,
  Phone,
  Menu,
  X,
  LogOut
} from 'lucide-react'

function App() {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboardOverview') // dashboard, campaigns, callLogs, callDetails, createCampaign, campaignDetails
  const [selectedCampaignType, setSelectedCampaignType] = useState(null) // incoming or outgoing
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null)
  const [campaigns, setCampaigns] = useState({ incoming: [], outgoing: [] })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [warningRemainingTime, setWarningRemainingTime] = useState(0)

  // Check authentication on mount and set up session management
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUser()
        if (userData) {
          setIsAuthenticatedState(true)
          setUser(userData)
          updateLastActivity()
          // Start session monitoring
          sessionManager.start(() => {
            handleLogout()
          }, (remainingTime) => {
            setWarningRemainingTime(remainingTime)
            setShowSessionWarning(true)
          })
        } else {
          clearAuth()
          setIsAuthenticatedState(false)
        }
      } else {
        setIsAuthenticatedState(false)
      }
    }
    checkAuth()

    // Cleanup session manager on component unmount
    return () => {
      sessionManager.stop()
    }
  }, [])

  // Handle successful login
  const handleLogin = (userData) => {
    setIsAuthenticatedState(true)
    setUser(userData)
    updateLastActivity()
    // Start session monitoring after login
    sessionManager.start(() => {
      handleLogout()
    }, (remainingTime) => {
      setWarningRemainingTime(remainingTime)
      setShowSessionWarning(true)
    })
  }

  // Handle logout
  const handleLogout = () => {
    // Stop session monitoring
    sessionManager.stop()
    clearAuth()
    setIsAuthenticatedState(false)
    setUser(null)
    setView('dashboardOverview')
    setSelectedCampaignType(null)
    setSelectedCampaign(null)
    setSelectedCall(null)
    setShowSessionWarning(false)
  }

  // Handle extending session from warning dialog
  const handleExtendSession = () => {
    sessionManager.extendSession()
    setShowSessionWarning(false)
    updateLastActivity()
  }

  // Handle logout from warning dialog
  const handleWarningLogout = () => {
    setShowSessionWarning(false)
    handleLogout()
  }

  const handleSelectCampaignType = (type) => {
    setSelectedCampaignType(type)
    setView('campaigns')
    setIsMobileMenuOpen(false)
  }

  const handleSelectCampaign = async (campaign) => {
    // If campaign has an ID, fetch full details from API
    if (campaign && (campaign._id || campaign.id)) {
      try {
        const campaignId = campaign._id || campaign.id
        const campaignDetails = await getCampaignById(campaignId)

        if (campaignDetails) {
          setSelectedCampaign(campaignDetails)
          setView('callLogs')
        } else {
          // Fallback to passed campaign data if API call fails
          setSelectedCampaign(campaign)
          setView('callLogs')
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error)
        // Fallback to passed campaign data if API call fails
        setSelectedCampaign(campaign)
        setView('callLogs')
      }
    } else {
      // Use passed campaign data directly
      setSelectedCampaign(campaign)
      setView('callLogs')
    }
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
    } else if (view === 'campaignDetails') {
      setView('dashboardOverview')
      setSelectedCampaignDetails(null)
    } else if (['dashboardOverview', 'projectTraining', 'apiDocs', 'wallet'].includes(view)) {
      setView('dashboardOverview')
    }
  }

  const handleHome = () => {
    setView('dashboardOverview')
    setSelectedCampaignType(null)
    setSelectedCampaign(null)
    setSelectedCall(null)
    setSelectedCampaignDetails(null)
  }

  const handleCampaignClick = async (campaign) => {
    // If campaign has an ID, fetch full details from API
    if (campaign && (campaign._id || campaign.id)) {
      try {
        const campaignId = campaign._id || campaign.id
        const campaignDetails = await getCampaignById(campaignId)

        if (campaignDetails) {
          setSelectedCampaignDetails(campaignDetails)
          setView('campaignDetails')
        } else {
          // Fallback to passed campaign data if API call fails
          setSelectedCampaignDetails(campaign)
          setView('campaignDetails')
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error)
        // Fallback to passed campaign data if API call fails
        setSelectedCampaignDetails(campaign)
        setView('campaignDetails')
      }
    } else {
      // Use passed campaign data directly
      setSelectedCampaignDetails(campaign)
      setView('campaignDetails')
    }
  }

  const handleCreateCampaign = () => {
    setView('createCampaign')
  }

  const handleSaveCampaign = async (campaignData) => {
    // Campaign data already contains the ID from API response
    // The CreateCampaign component handles API call and passes the response data
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

  // Show login screen if not authenticated
  if (!isAuthenticatedState) {
    return <Login onLogin={handleLogin} />
  }

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
          <div className="flex items-center justify-between mb-4">
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
          {/* User Info and Logout */}
          {user && (
            <div className="pt-4 border-t border-secondary-200 space-y-3">
              {/* User Profile Section */}
              <div className="bg-secondary-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-secondary-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-secondary-600 truncate mt-0.5">{user.email}</p>
                    <p className="text-xs text-secondary-500 truncate mt-0.5">{user.phone}</p>
                    {user.lastLoginAt && (
                      <p className="text-xs text-secondary-400 truncate mt-1">
                        Last login: {new Date(user.lastLoginAt).toLocaleDateString()} {new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-1.5 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
          <DashboardOverview
            onBack={handleBack}
            onHome={handleHome}
            onCampaignClick={handleCampaignClick}
          />
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

        {view === 'campaignDetails' && (
          <CampaignDetails
            campaign={selectedCampaignDetails}
            onBack={handleBack}
            onHome={handleHome}
          />
        )}
      </main>

      {/* Session Warning Modal */}
      <SessionWarning
        isVisible={showSessionWarning}
        onExtend={handleExtendSession}
        onLogout={handleWarningLogout}
        remainingTime={warningRemainingTime}
      />
    </div>
  )
}

export default App

