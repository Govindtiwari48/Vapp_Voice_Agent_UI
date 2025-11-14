import { useState } from 'react'
import { ArrowLeft, Home, Save, X, PhoneIncoming, PhoneOutgoing, Info } from 'lucide-react'

const CreateCampaign = ({ type, onBack, onHome, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'active', // active or paused
    campaignType: type, // incoming or outgoing
    // Additional fields for campaign configuration
    startDate: '',
    endDate: '',
    timeZone: 'America/New_York',
    maxCallsPerDay: '',
    callSchedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: []
    },
    // Voice agent settings
    voiceAgentSettings: {
      agentName: '',
      language: 'en-US',
      voiceType: 'neural',
      greetingMessage: '',
      fallbackMessage: ''
    },
    // Lead qualification settings
    leadQualification: {
      enabled: true,
      requiredFields: [],
      qualificationCriteria: ''
    },
    // Integration settings
    integrationSettings: {
      crmIntegration: false,
      webhookUrl: '',
      autoAssign: false
    }
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Property Inquiry',
    'Follow-up',
    'Appointment Scheduling',
    'Customer Support',
    'Sales Outreach',
    'Lead Qualification',
    'Survey',
    'Announcement',
    'Other'
  ]

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      callSchedule: {
        ...prev.callSchedule,
        daysOfWeek: prev.callSchedule.daysOfWeek.includes(day)
          ? prev.callSchedule.daysOfWeek.filter(d => d !== day)
          : [...prev.callSchedule.daysOfWeek, day]
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.maxCallsPerDay && (isNaN(formData.maxCallsPerDay) || formData.maxCallsPerDay < 1)) {
      newErrors.maxCallsPerDay = 'Must be a positive number'
    }

    if (formData.callSchedule.enabled && formData.callSchedule.daysOfWeek.length === 0) {
      newErrors.callScheduleDays = 'Select at least one day for call schedule'
    }

    if (!formData.voiceAgentSettings.agentName.trim()) {
      newErrors.agentName = 'Agent name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Call the onSave callback with form data
      await onSave(formData)
    } catch (error) {
      console.error('Error saving campaign:', error)
      setErrors({ submit: 'Failed to save campaign. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isIncoming = type === 'incoming'

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors flex-shrink-0"
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
                    Create {isIncoming ? 'Incoming' : 'Outgoing'} Campaign
                  </h1>
                  <p className="text-xs text-secondary-500">Fill in the details below</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-secondary-900">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="e.g., Property Inquiry - Premium Listings"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.category ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="Describe the purpose and goals of this campaign..."
                  required
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-secondary-700 mb-1">
                  Initial Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active (Live)</option>
                  <option value="paused">Paused</option>
                </select>
                <p className="mt-1 text-xs text-secondary-500">
                  Campaign will be {formData.status === 'active' ? 'live' : 'paused'} upon creation
                </p>
              </div>
            </div>
          </div>

          {/* Call Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Call Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="maxCallsPerDay" className="block text-sm font-medium text-secondary-700 mb-1">
                  Maximum Calls Per Day
                </label>
                <input
                  type="number"
                  id="maxCallsPerDay"
                  name="maxCallsPerDay"
                  value={formData.maxCallsPerDay}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.maxCallsPerDay ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="Leave empty for unlimited"
                />
                {errors.maxCallsPerDay && <p className="mt-1 text-sm text-red-600">{errors.maxCallsPerDay}</p>}
              </div>

              <div>
                <label htmlFor="timeZone" className="block text-sm font-medium text-secondary-700 mb-1">
                  Time Zone
                </label>
                <select
                  id="timeZone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="callSchedule.enabled"
                    checked={formData.callSchedule.enabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-700">Enable Call Schedule</span>
                </label>
                
                {formData.callSchedule.enabled && (
                  <div className="mt-4 space-y-4 pl-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-secondary-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          name="callSchedule.startTime"
                          value={formData.callSchedule.startTime}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-secondary-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          name="callSchedule.endTime"
                          value={formData.callSchedule.endTime}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Days of Week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleDayToggle(day.value)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              formData.callSchedule.daysOfWeek.includes(day.value)
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {errors.callScheduleDays && (
                        <p className="mt-1 text-sm text-red-600">{errors.callScheduleDays}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voice Agent Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Voice Agent Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-secondary-700 mb-1">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="voiceAgentSettings.agentName"
                  value={formData.voiceAgentSettings.agentName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.agentName ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  placeholder="e.g., Sarah, Premium Properties"
                  required
                />
                {errors.agentName && <p className="mt-1 text-sm text-red-600">{errors.agentName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-secondary-700 mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    name="voiceAgentSettings.language"
                    value={formData.voiceAgentSettings.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="voiceType" className="block text-sm font-medium text-secondary-700 mb-1">
                    Voice Type
                  </label>
                  <select
                    id="voiceType"
                    name="voiceAgentSettings.voiceType"
                    value={formData.voiceAgentSettings.voiceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="neural">Neural (Recommended)</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="greetingMessage" className="block text-sm font-medium text-secondary-700 mb-1">
                  Greeting Message
                </label>
                <textarea
                  id="greetingMessage"
                  name="voiceAgentSettings.greetingMessage"
                  value={formData.voiceAgentSettings.greetingMessage}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Custom greeting message for the voice agent..."
                />
              </div>

              <div>
                <label htmlFor="fallbackMessage" className="block text-sm font-medium text-secondary-700 mb-1">
                  Fallback Message
                </label>
                <textarea
                  id="fallbackMessage"
                  name="voiceAgentSettings.fallbackMessage"
                  value={formData.voiceAgentSettings.fallbackMessage}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Message to use when the agent cannot understand the request..."
                />
              </div>
            </div>
          </div>

          {/* Lead Qualification Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Lead Qualification Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="leadQualification.enabled"
                  checked={formData.leadQualification.enabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Enable Lead Qualification</span>
              </label>

              {formData.leadQualification.enabled && (
                <div>
                  <label htmlFor="qualificationCriteria" className="block text-sm font-medium text-secondary-700 mb-1">
                    Qualification Criteria
                  </label>
                  <textarea
                    id="qualificationCriteria"
                    name="leadQualification.qualificationCriteria"
                    value={formData.leadQualification.qualificationCriteria}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe what makes a qualified lead..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Integration Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Integration Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="integrationSettings.crmIntegration"
                  checked={formData.integrationSettings.crmIntegration}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Enable CRM Integration</span>
              </label>

              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-secondary-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  id="webhookUrl"
                  name="integrationSettings.webhookUrl"
                  value={formData.integrationSettings.webhookUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://your-api.com/webhook"
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Webhook URL to receive call events and updates
                </p>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="integrationSettings.autoAssign"
                  checked={formData.integrationSettings.autoAssign}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-secondary-700">Auto-assign leads to agents</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCampaign


