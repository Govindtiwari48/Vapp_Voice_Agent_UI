import { useState, useEffect } from 'react'
import { Settings, X, CheckCircle, AlertCircle } from 'lucide-react'
import { getUserProfile, updateAIProjectId } from '../api/index'

function AIProjectIdModal({ isVisible, onClose, onSuccess }) {
  const [aiProjectId, setAiProjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (isVisible) {
      // Check if user already has an AI Project ID
      checkExistingAIProjectId()
    } else {
      // Reset state when modal is closed
      setAiProjectId('')
      setError('')
      setSuccess(false)
      setIsChecking(false)
    }
  }, [isVisible])

  const checkExistingAIProjectId = async () => {
    try {
      setIsChecking(true)
      const response = await getUserProfile()
      if (response.user && response.user.aiProjectId) {
        // User already has an AI Project ID, don't show the modal
        onClose()
      } else {
        // User doesn't have an AI Project ID, show the modal
        setIsChecking(false)
      }
    } catch (err) {
      console.error('Error checking user profile:', err)
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!aiProjectId.trim()) {
      setError('Please enter your AI Project ID')
      return
    }

    // Basic validation for email format
    if (!aiProjectId.includes('@') || !aiProjectId.includes('.com')) {
      setError('Please enter a valid AI Project ID (e.g., your_project_id@openai.com)')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await updateAIProjectId(aiProjectId)
      
      setSuccess(true)
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(response.user)
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update AI Project ID')
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible || isChecking) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900">
              Set Your AI Project ID
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-secondary-600 mb-4 text-sm">
            To enable AI-powered features, please set your AI Project ID. This should be your custom project ID with an email format (e.g., your_project_id@openai.com).
          </p>

          {success ? (
            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">AI Project ID updated successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="aiProjectId" className="block text-sm font-medium text-secondary-700 mb-2">
                  AI Project ID
                </label>
                <input
                  id="aiProjectId"
                  type="text"
                  value={aiProjectId}
                  onChange={(e) => setAiProjectId(e.target.value)}
                  placeholder="your_project_id@openai.com"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {error && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-secondary-200 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-xs text-secondary-500 mt-4">
          You can always update your AI Project ID later from your profile settings.
        </p>
      </div>
    </div>
  )
}

export default AIProjectIdModal