import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Home, PhoneIncoming, PhoneOutgoing, Phone, Clock, CheckCircle, TrendingUp, Plus, Pause, Play, Loader2, AlertCircle, Edit2, Settings, X, Search, Trash2, Filter as FilterIcon } from 'lucide-react'
import { getCampaigns, updateCampaignStatus, updateCampaignBasicInfo, updateCampaignSettings, updateCampaignPhoneNumbers, deleteCampaign } from '../api'

const CampaignList = ({ type, campaigns: propCampaigns, onSelectCampaign, onBack, onHome, onCreateCampaign, onToggleCampaignStatus }) => {
  const isIncoming = type === 'incoming'
  const [campaigns, setCampaigns] = useState(propCampaigns || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  })
  const [statusFilter, setStatusFilter] = useState('') // Status filter
  const [tidFilter, setTidFilter] = useState('') // TID filter
  const [searchQuery, setSearchQuery] = useState('') // Search input value
  const [activeSearchQuery, setActiveSearchQuery] = useState('') // Active search query used for API calls
  const [updating, setUpdating] = useState(null) // Track which campaign is being updated
  const [deleting, setDeleting] = useState(null) // Track which campaign is being deleted
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false) // Delete confirmation modal
  const [campaignToDelete, setCampaignToDelete] = useState(null) // Campaign to delete

  // Edit modal states
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', status: '' })
  const [editErrors, setEditErrors] = useState({})

  // Settings modal states
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [settingsCampaign, setSettingsCampaign] = useState(null)
  const [settingsForm, setSettingsForm] = useState({
    maxCalls: '',
    callTimeout: '',
    retryAttempts: '',
    workingHoursStart: '',
    workingHoursEnd: '',
    timezone: 'Asia/Kolkata'
  })

  // Map internal type names to API type names
  const apiType = type === 'incoming' ? 'inbound' : 'outbound'

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Helper function to format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Calculate Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = []
    const len1 = str1.length
    const len2 = str2.length

    if (len1 === 0) return len2
    if (len2 === 0) return len1

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[len2][len1]
  }

  // Calculate similarity score (0-1, where 1 is exact match)
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
    return (longer.length - distance) / longer.length
  }

  // Professional search function with fuzzy matching
  const performSearch = (campaigns, query) => {
    if (!query || !query.trim()) {
      return campaigns
    }

    const searchTerm = query.trim().toLowerCase()
    const results = []

    // Step 1: Exact match (case-insensitive)
    const exactMatches = campaigns.filter(campaign =>
      campaign.name.toLowerCase() === searchTerm
    )

    // Step 2: Partial match (contains)
    const partialMatches = campaigns.filter(campaign => {
      const name = campaign.name.toLowerCase()
      return name.includes(searchTerm) && !exactMatches.includes(campaign)
    })

    // Step 3: Fuzzy match (similarity > 0.6)
    const fuzzyMatches = campaigns.filter(campaign => {
      if (exactMatches.includes(campaign) || partialMatches.includes(campaign)) {
        return false
      }
      const similarity = calculateSimilarity(campaign.name, searchTerm)
      return similarity >= 0.6
    })

    // Combine results: exact matches first, then partial, then fuzzy
    return [...exactMatches, ...partialMatches, ...fuzzyMatches]
  }

  // Handle search button click or Enter key
  const handleSearch = () => {
    setActiveSearchQuery(searchQuery.trim())
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setActiveSearchQuery('')
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Fetch campaigns when type or filters change
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!type) return

      setLoading(true)
      setError(null)

      try {
        const params = {
          type: apiType,
          page: pagination.currentPage,
          limit: pagination.limit
        }

         // Add status filter if selected
        if (statusFilter) {
          params.status = statusFilter
        }

        // Add TID filter if provided
        if (tidFilter.trim()) {
          params.tid = tidFilter.trim()
        }

        // Add search query if provided (use active search query)
        if (activeSearchQuery.trim()) {
          params.search = activeSearchQuery.trim()
        }

        const result = await getCampaigns(params)

        if (result && result.campaigns) {
          // Transform API campaign data to match component expectations
          let transformedCampaigns = result.campaigns.map(campaign => ({
            id: campaign._id,
            tid: campaign.tids && campaign.tids.length > 0 ? campaign.tids[0] : null,
            name: campaign.name || 'N/A',
            status: campaign.status || 'N/A',
            createdDate: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A',
            createdDateTime: campaign.createdAt ? formatDateTime(campaign.createdAt) : 'N/A',
            // Use nullish coalescing to preserve 0 values, only use null for undefined/null
            totalCalls: campaign.metrics?.totalCalls !== undefined && campaign.metrics?.totalCalls !== null ? campaign.metrics.totalCalls : null,
            successfulCalls: campaign.metrics?.successfulCalls !== undefined && campaign.metrics?.successfulCalls !== null ? campaign.metrics.successfulCalls : null,
            // Preserve 0 as valid value for avgDuration
            avgDuration: campaign.metrics?.avgDuration !== undefined && campaign.metrics?.avgDuration !== null ? formatDuration(campaign.metrics.avgDuration) : null,
            // Store full campaign data for details view
            _fullData: campaign
          }))

          // Apply professional fuzzy search if search query is provided
          // This enhances backend search with client-side fuzzy matching
          if (activeSearchQuery.trim()) {
            transformedCampaigns = performSearch(transformedCampaigns, activeSearchQuery)
          }

          setCampaigns(transformedCampaigns)
          setPagination(result.pagination || pagination)
        } else {
          setCampaigns([])
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError(err.message || 'Failed to fetch campaigns')
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, apiType, pagination.currentPage, statusFilter, tidFilter, activeSearchQuery])

  // Update campaigns when propCampaigns changes (for external updates)
  // Only use propCampaigns if explicitly provided and not empty
  // This allows parent components to override, but we prioritize API data
  useEffect(() => {
    // Only update if propCampaigns is explicitly provided (not from default state)
    // and we're not currently loading from API
    if (!loading && propCampaigns && propCampaigns.length > 0 && Array.isArray(propCampaigns)) {
      // Verify it's real data, not just empty arrays from state initialization
      const hasRealData = propCampaigns.some(c => c && (c.id || c._id))
      if (hasRealData) {
        setCampaigns(propCampaigns)
      }
    }
  }, [propCampaigns, loading])

  const handleCampaignClick = (campaign) => {
    // Pass the full campaign data if available, otherwise pass the transformed data
    onSelectCampaign(campaign._fullData || campaign)
  }

  // Handle pause/resume campaign
  const handleToggleStatus = async (campaign, e) => {
    e.stopPropagation()

    const campaignId = campaign.id || campaign._id
    const currentStatus = campaign.status || campaign._fullData?.status
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'

    setUpdating(campaignId)

    try {
      const result = await updateCampaignStatus(campaignId, newStatus)

      if (result.success) {
        // Update local state
        setCampaigns(prev => prev.map(c =>
          (c.id === campaignId || c._id === campaignId)
            ? { ...c, status: newStatus, _fullData: { ...c._fullData, status: newStatus } }
            : c
        ))
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error)
      setError(error.message || 'Failed to update campaign status')
    } finally {
      setUpdating(null)
    }
  }

  // Handle edit campaign
  const handleEditClick = (campaign, e) => {
    e.stopPropagation()
    const fullData = campaign._fullData || campaign
    setEditingCampaign(fullData)
    setEditForm({
      name: fullData.name || '',
      description: fullData.description || '',
      status: fullData.status || 'active'
    })
    setEditErrors({})
    setEditModalOpen(true)
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingCampaign) return

    const campaignId = editingCampaign._id || editingCampaign.id
    setUpdating(campaignId)
    setEditErrors({})

    try {
      const result = await updateCampaignBasicInfo(campaignId, editForm)

      if (result.success) {
        // Refresh campaigns list
        setCampaigns(prev => prev.map(c => {
          const cId = c.id || c._id
          if (cId === campaignId) {
            return {
              ...c,
              name: editForm.name,
              status: editForm.status,
              _fullData: {
                ...c._fullData,
                name: editForm.name,
                description: editForm.description,
                status: editForm.status
              }
            }
          }
          return c
        }))
        setEditModalOpen(false)
        setEditingCampaign(null)
        setEditForm({ name: '', description: '', status: '' })
      } else {
        throw new Error(result.message || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('Failed to update campaign:', error)

      // Check if error is related to unique campaign name
      const errorMessage = error.message || 'Failed to update campaign'
      const isUniqueNameError = errorMessage.toLowerCase().includes('name') &&
        (errorMessage.toLowerCase().includes('unique') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('duplicate'))

      if (isUniqueNameError) {
        setEditErrors({
          name: 'Campaign name already exists. Please choose a different name.'
        })
      } else {
        setError(errorMessage)
      }
    } finally {
      setUpdating(null)
    }
  }

  // Handle settings modal
  const handleSettingsClick = (campaign, e) => {
    e.stopPropagation()
    const fullData = campaign._fullData || campaign
    const settings = fullData.settings || {}
    const workingHours = settings.workingHours || {}

    setSettingsCampaign(fullData)
    setSettingsForm({
      maxCalls: settings.maxCalls || '',
      callTimeout: settings.callTimeout || '',
      retryAttempts: settings.retryAttempts || '',
      workingHoursStart: workingHours.start || '',
      workingHoursEnd: workingHours.end || '',
      timezone: workingHours.timezone || 'Asia/Kolkata'
    })
    setSettingsModalOpen(true)
  }

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!settingsCampaign) return

    const campaignId = settingsCampaign._id || settingsCampaign.id
    setUpdating(campaignId)

    try {
      const settings = {
        callTimeout: parseInt(settingsForm.callTimeout) || 30,
      }

      // Add outbound-specific settings
      if (!isIncoming) {
        if (settingsForm.maxCalls) settings.maxCalls = parseInt(settingsForm.maxCalls)
        if (settingsForm.retryAttempts) settings.retryAttempts = parseInt(settingsForm.retryAttempts)

        if (settingsForm.workingHoursStart && settingsForm.workingHoursEnd) {
          settings.workingHours = {
            start: settingsForm.workingHoursStart,
            end: settingsForm.workingHoursEnd,
            timezone: settingsForm.timezone
          }
        }
      }

      const result = await updateCampaignSettings(campaignId, settings)

      if (result.success) {
        setSettingsModalOpen(false)
        setSettingsCampaign(null)
        // Optionally refresh the campaigns list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update campaign settings:', error)
      setError(error.message || 'Failed to update campaign settings')
    } finally {
      setUpdating(null)
    }
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  // Handle delete campaign
  const handleDeleteClick = (campaign, e) => {
    e.stopPropagation()
    setCampaignToDelete(campaign)
    setDeleteConfirmOpen(true)
  }

  // Confirm delete campaign
  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return

    const campaignId = campaignToDelete.id || campaignToDelete._id
    setDeleting(campaignId)

    try {
      const result = await deleteCampaign(campaignId)

      if (result.success) {
        // Remove campaign from local state
        setCampaigns(prev => prev.filter(c => (c.id !== campaignId && c._id !== campaignId)))
        // Reset pagination if needed
        if (campaigns.length === 1 && pagination.currentPage > 1) {
          setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
        }
        setDeleteConfirmOpen(false)
        setCampaignToDelete(null)
      } else {
        throw new Error(result.message || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      setError(error.message || 'Failed to delete campaign')
      setDeleteConfirmOpen(false)
      setCampaignToDelete(null)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
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
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isIncoming ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isIncoming ? (
                    <PhoneIncoming className={`w-4 h-4 sm:w-5 sm:h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  ) : (
                    <PhoneOutgoing className={`w-4 h-4 sm:w-5 sm:h-5 ${isIncoming ? 'text-green-600' : 'text-blue-600'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-secondary-900 truncate">
                    {isIncoming ? 'Incoming' : 'Outgoing'} Campaigns
                  </h1>
                  <p className="text-xs text-secondary-500">
                    {pagination.totalRecords > 0 ? pagination.totalRecords : campaigns.length} campaigns
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onCreateCampaign}
              className="btn-primary flex items-center space-x-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Campaign</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Filters Section */}
        <div className="card p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 w-full">
                <p className="text-xs text-secondary-500 mb-1">Search Campaign Name</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Search by campaign name..."
                      className="input text-sm py-2 pl-10 pr-4 w-full"
                      disabled={loading}
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        title="Clear search"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="btn-primary flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    type="button"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
                {activeSearchQuery && (
                  <p className="text-xs text-secondary-500 mt-1">
                    Showing results for: <span className="font-medium text-secondary-700">"{activeSearchQuery}"</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-secondary-500 mb-1">Filter Campaigns</p>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setPagination(prev => ({ ...prev, currentPage: 1 }))
                    }}
                    className="input text-sm py-2 px-3 pr-8"
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                  {statusFilter && (
                    <button
                      onClick={() => {
                        setStatusFilter('')
                        setPagination(prev => ({ ...prev, currentPage: 1 }))
                      }}
                      className="text-sm text-secondary-600 hover:text-secondary-900"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-secondary-500">
                Showing {campaigns.length} of {pagination.totalRecords} campaigns
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="card p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-600">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Retry</span>
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-secondary-600 mb-4">No campaigns found. Create your first campaign to get started.</p>
            <button
              onClick={onCreateCampaign}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {campaigns.map((campaign) => {
              // Calculate success rate - 0 is a valid value, only null/undefined means N/A
              const successRate = (campaign.totalCalls !== null && campaign.totalCalls !== undefined &&
                campaign.successfulCalls !== null && campaign.successfulCalls !== undefined)
                ? (campaign.totalCalls > 0
                  ? Math.round((campaign.successfulCalls / campaign.totalCalls) * 100)
                  : 0) // If totalCalls is 0, success rate is 0%
                : null

              return (
                <div
                  key={campaign.id}
                  className="card p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-primary-300"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleCampaignClick(campaign)}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-secondary-900 truncate flex-1 min-w-0">{campaign.name}</h3>
                        {campaign.status === 'active' ? (
                          <span className="badge badge-success flex-shrink-0">Active</span>
                        ) : (
                          <span className="badge badge-warning flex-shrink-0">Paused</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary-500">
                        <span className="truncate">ID: {campaign.id || 'N/A'}</span>
                        {campaign.tid && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">TID: {campaign.tid}</span>
                          </>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">Created: {campaign.createdDateTime}</span>
                        {campaign.totalCalls !== null && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>{campaign.totalCalls} calls</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Edit Button */}
                      <button
                        onClick={(e) => handleEditClick(campaign, e)}
                        className="p-2 rounded-lg transition-colors hover:bg-blue-100 text-blue-600"
                        title="Edit Campaign"
                        aria-label="Edit Campaign"
                        disabled={updating === campaign.id || deleting === campaign.id}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Settings Button - Outbound only */}
                      {!isIncoming && (
                        <button
                          onClick={(e) => handleSettingsClick(campaign, e)}
                          className="p-2 rounded-lg transition-colors hover:bg-purple-100 text-purple-600"
                          title="Campaign Settings"
                          aria-label="Campaign Settings"
                          disabled={updating === campaign.id || deleting === campaign.id}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}

                      {/* Pause/Resume Button */}
                      <button
                        onClick={(e) => handleToggleStatus(campaign, e)}
                        className={`p-2 rounded-lg transition-colors ${campaign.status === 'active'
                          ? 'hover:bg-yellow-100 text-yellow-600'
                          : 'hover:bg-green-100 text-green-600'
                          }`}
                        title={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                        aria-label={campaign.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                        disabled={updating === campaign.id || deleting === campaign.id}
                      >
                        {updating === campaign.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : campaign.status === 'active' ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteClick(campaign, e)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-600"
                        title="Delete Campaign"
                        aria-label="Delete Campaign"
                        disabled={updating === campaign.id || deleting === campaign.id}
                      >
                        {deleting === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 cursor-pointer"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                        <p className="text-xs text-secondary-500 truncate">Total Calls</p>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-secondary-900">
                        {campaign.totalCalls !== null ? campaign.totalCalls : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-xs text-secondary-500 truncate">Successful</p>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-green-600">
                        {campaign.successfulCalls !== null ? campaign.successfulCalls : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-secondary-500 truncate">Success Rate</p>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-blue-600">
                        {successRate !== null ? `${successRate}%` : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <p className="text-xs text-secondary-500 truncate">Avg Duration</p>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-purple-600">
                        {campaign.avgDuration !== null ? campaign.avgDuration : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="card p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-secondary-700">
                Page <span className="font-bold text-primary-700">{pagination.currentPage}</span> of <span className="font-bold text-primary-700">{pagination.totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-secondary-600">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Campaign Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Edit Campaign</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm({ ...editForm, name: e.target.value })
                      // Clear error when user starts typing
                      if (editErrors.name) {
                        setEditErrors({ ...editErrors, name: '' })
                      }
                    }}
                    className={`input w-full ${editErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter campaign name"
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="input w-full"
                    rows="3"
                    placeholder="Enter campaign description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input w-full"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editForm.name || updating}
                  className="btn-primary flex-1"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="btn-secondary flex-1"
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Outbound only) */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Campaign Settings</h3>
                <button
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Call Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.callTimeout}
                    onChange={(e) => setSettingsForm({ ...settingsForm, callTimeout: e.target.value })}
                    className="input w-full"
                    placeholder="30"
                    min="1"
                  />
                </div>

                {!isIncoming && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Max Calls
                      </label>
                      <input
                        type="number"
                        value={settingsForm.maxCalls}
                        onChange={(e) => setSettingsForm({ ...settingsForm, maxCalls: e.target.value })}
                        className="input w-full"
                        placeholder="100"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Retry Attempts
                      </label>
                      <input
                        type="number"
                        value={settingsForm.retryAttempts}
                        onChange={(e) => setSettingsForm({ ...settingsForm, retryAttempts: e.target.value })}
                        className="input w-full"
                        placeholder="2"
                        min="0"
                      />
                    </div>

                    <div className="border-t border-secondary-200 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-secondary-900 mb-3">Working Hours</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-secondary-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={settingsForm.workingHoursStart}
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursStart: e.target.value })}
                            className="input w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-secondary-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={settingsForm.workingHoursEnd}
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursEnd: e.target.value })}
                            className="input w-full"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-secondary-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settingsForm.timezone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                          className="input w-full text-sm"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={updating}
                  className="btn-primary flex-1"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
                <button
                  onClick={() => setSettingsModalOpen(false)}
                  className="btn-secondary flex-1"
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && campaignToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">Delete Campaign</h3>
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false)
                    setCampaignToDelete(null)
                  }}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
                  disabled={deleting}
                >
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-secondary-700 mb-2">
                  Are you sure you want to delete this campaign? This action cannot be undone.
                </p>
                <div className="bg-secondary-50 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-secondary-900">Campaign Name:</p>
                  <p className="text-sm text-secondary-700">{campaignToDelete.name}</p>
                  <p className="text-xs text-secondary-500 mt-1">ID: {campaignToDelete.id || campaignToDelete._id}</p>
                  {campaignToDelete.tid && (
                    <p className="text-xs text-secondary-500">TID: {campaignToDelete.tid}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Campaign'
                  )}
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false)
                    setCampaignToDelete(null)
                  }}
                  className="btn-secondary flex-1"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignList

