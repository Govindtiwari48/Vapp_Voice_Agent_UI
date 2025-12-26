import { useState, useEffect } from 'react'
import { ArrowLeft, Edit2, Check, X, Settings, Save, User } from 'lucide-react'
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

  const handleCancel = () => {
    setEditMode(false)
    setAiProjectId(originalAiProjectId)
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    try {
      if (!aiProjectId.trim()) {
        setError('AI Project ID cannot be empty')
        return
      }

      // Basic validation for email format
      if (!aiProjectId.includes('@') || !aiProjectId.includes('.com')) {
        setError('Please enter a valid AI Project ID (e.g., your_project_id@openai.com)')
        return
      }

      setSaving(true)
      setError('')
      
      const response = await updateUserProfile({ aiProjectId })
      
      if (response.user) {
        setUserData(response.user)
        setOriginalAiProjectId(response.user.aiProjectId)
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