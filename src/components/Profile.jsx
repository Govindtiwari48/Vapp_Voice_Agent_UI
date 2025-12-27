import { useState, useEffect } from 'react'
import { ArrowLeft, Edit2, Check, X, Settings, Save, User, Link, Copy, Check as CheckIcon, AlertCircle, Info } from 'lucide-react'
import { getUserProfile, updateUserProfile } from '../api/index'

function Profile({ onBack, onProfileUpdate }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [aiProjectId, setAiProjectId] = useState('')
  const [originalAiProjectId, setOriginalAiProjectId] = useState('')
  const [voiceId, setVoiceId] = useState('')
  const [originalVoiceId, setOriginalVoiceId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getUserProfile()
      if (response.user) {
        setUserData(response.user)
        setAiProjectId(response.user.aiProjectId || '')
        setOriginalAiProjectId(response.user.aiProjectId || '')
        setVoiceId(response.user.voiceId || '')
        setOriginalVoiceId(response.user.voiceId || '')
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditMode(true)
    setError('')
    setSuccess('')
  }

  const copyApiUrl = async () => {
    // Build URL with only actual database values
    const voiceIdValue = userData?.voiceId || userData?.voice_id || '5628'
    const apiUrl = `http://180.150.249.216/webapi/datapush?username=testapi1@api.com&password=123@123&phonenumber=PHONE_NUMBERS&callerid=fixed&voiceid=${voiceIdValue}`
    try {
      await navigator.clipboard.writeText(apiUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setAiProjectId(originalAiProjectId)
    setVoiceId(originalVoiceId)
    setError('')
    setSuccess('')
  }


  const handleSave = async () => {
    try {
      // Prepare update payload - only include fields that have changed or are being set
      const updatePayload = {}
      
      // Only add aiProjectId to payload if it has changed or is being set/updated
      if (aiProjectId !== originalAiProjectId) {
        if (!aiProjectId.trim()) {
          setError('AI Project ID cannot be empty')
          return
        }
        // Basic validation for email format
        if (!aiProjectId.includes('@') || !aiProjectId.includes('.com')) {
          setError('Please enter a valid AI Project ID (e.g., your_project_id@openai.com)')
          return
        }
        updatePayload.aiProjectId = aiProjectId
      }
      
      // Only add voiceId to payload if it has changed or is being set/updated
      if (voiceId !== originalVoiceId) {
        updatePayload.voiceId = voiceId
      }
      
      // If nothing has changed, just exit edit mode
      if (Object.keys(updatePayload).length === 0) {
        setEditMode(false)
        return
      }

      setSaving(true)
      setError('')
      
      const response = await updateUserProfile(updatePayload)
      
      if (response.user) {
        setUserData(response.user)
        setOriginalAiProjectId(response.user.aiProjectId || '')
        setOriginalVoiceId(response.user.voiceId || '')
        setEditMode(false)
        setSuccess('Profile updated successfully!')
        
        // Notify parent component
        if (onProfileUpdate) {
          onProfileUpdate(response.user)
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded mb-4 w-32"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-secondary-200 rounded mb-4 w-48"></div>
              <div className="space-y-4">
                <div className="h-4 bg-secondary-200 rounded w-64"></div>
                <div className="h-4 bg-secondary-200 rounded w-56"></div>
                <div className="h-4 bg-secondary-200 rounded w-72"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-secondary-600" />
              <h1 className="text-xl font-semibold text-secondary-900">Profile</h1>
            </div>

            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && !editMode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Personal Information</h2>
              {!editMode && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Full Name</label>
              <p className="text-secondary-900 text-base font-medium">
                {userData.firstName} {userData.lastName}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
              <p className="text-secondary-900 text-base">{userData.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Phone Number</label>
              <p className="text-secondary-900 text-base">{userData.phone}</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">User Role</label>
              <p className="text-secondary-900 text-base capitalize">{userData.role || 'User'}</p>
            </div>

            {/* AI Project ID */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-4 h-4 text-secondary-500" />
                <label className="block text-sm font-medium text-secondary-700">AI Project ID</label>
                {userData.aiProjectId && !editMode && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              {editMode ? (
                <div>
                  <input
                    type="text"
                    value={aiProjectId}
                    onChange={(e) => setAiProjectId(e.target.value)}
                    placeholder="your_project_id@openai.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-secondary-300 focus:ring-primary-500'
                    }`}
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                  <p className="text-secondary-500 text-xs mt-2">
                    Enter your AI Project ID in the format: your_project_id@openai.com
                  </p>
                </div>
              ) : (
                <div>
                  {userData.aiProjectId ? (
                    <p className="text-secondary-900 text-base font-mono">
                      {userData.aiProjectId}
                    </p>
                  ) : (
                    <p className="text-secondary-500 text-base italic">
                      No AI Project ID configured
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Voice ID */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-4 h-4 text-secondary-500" />
                <label className="block text-sm font-medium text-secondary-700">Voice ID</label>
                {userData.voiceId && !editMode && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              {editMode ? (
                <div>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Enter your Voice ID"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-secondary-500 text-xs mt-2">
                    Optional: Enter your custom Voice ID for voice-related features
                  </p>
                </div>
              ) : (
                <div>
                  {userData.voiceId ? (
                    <p className="text-secondary-900 text-base font-mono">
                      {userData.voiceId}
                    </p>
                  ) : (
                    <p className="text-secondary-500 text-base italic">
                      No Voice ID configured
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* API Endpoint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Link className="w-5 h-5 text-blue-600" />
                <h3 className="text-md font-semibold text-blue-900 flex-1">WebAPI/DataPush Endpoint</h3>
                <button
                  onClick={copyApiUrl}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {copied ? (
                    <><CheckIcon className="w-3 h-3 text-green-600" /><span className="text-green-600">Copied!</span></>
                  ) : (
                    <><Copy className="w-3 h-3" /><span>Copy</span></>
                  )}
                </button>
              </div>
              
              <div className="bg-white border border-blue-200 rounded-md p-3 mb-3">
                <p className="text-xs text-blue-700 mb-1 font-medium">Full URL (when campaign numbers are added):</p>
                <code className="text-xs text-neutral-800 font-mono break-all">
                  {userData ? (
                    `http://180.150.249.216/webapi/datapush?username=testapi1@api.com&password=123@123&phonenumber={phone_numbers}&callerid=fixed&voiceid=${userData.voiceId || userData.voice_id || '5628'}${userData.aiProjectId ? `&aiprojectid=${userData.aiProjectId}` : ''}`
                  ) : (
                    'http://180.150.249.216/webapi/datapush?...'
                  )}
                </code>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-green-700 font-medium mb-2 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      From Database (Dynamic):
                    </p>
                    <ul className="text-xs space-y-2">
                      <li className="flex items-center justify-between">
                        <span className="text-neutral-600">voiceid:</span>
                        <code className="bg-white px-2 py-1 rounded font-mono text-green-700">
                          {userData?.voiceId || userData?.voice_id || '5628'}
                        </code>
                      </li>
                      {userData?.aiProjectId && (
                        <li className="flex items-center justify-between">
                          <span className="text-neutral-600">aiprojectid:</span>
                          <code className="bg-white px-2 py-1 rounded font-mono text-green-700 text-xs max-w-[150px] truncate">
                            {userData.aiProjectId}
                          </code>
                        </li>
                      )}
                      {!userData?.aiProjectId && (
                        <li className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          No aiProjectId configured. Click Edit to add.
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-700 font-medium mb-2 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      Static Values (Fixed):
                    </p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">username:</span>
                        <code className="bg-white px-2 py-1 rounded font-mono text-gray-700">testapi1@api.com</code>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">password:</span>
                        <code className="bg-white px-2 py-1 rounded font-mono text-gray-700">123@123</code>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-600">callerid:</span>
                        <code className="bg-white px-2 py-1 rounded font-mono text-gray-700">fixed</code>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-3 flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-0.5" />
                  <span><strong>Dynamic PHONENUMBER:</strong> This value will be replaced with the actual comma-separated list of phone numbers from the campaign when called.</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Account Status</label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${userData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-base font-medium ${userData.isActive ? 'text-green-700' : 'text-red-700'}`}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Account Created</label>
                <p className="text-secondary-900 text-base">
                  {userData.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString() 
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Last Login</label>
                <p className="text-secondary-900 text-base">
                  {userData.lastLoginAt 
                    ? new Date(userData.lastLoginAt).toLocaleDateString() + ' ' + 
                      new Date(userData.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile