import { useState } from 'react'
import { ArrowLeft, Home, Save, X, PhoneIncoming, PhoneOutgoing, Phone, Info, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { createCampaign } from '../api'

const CreateCampaign = ({ type, onBack, onHome, onSave, user }) => {
  const isIncoming = type === 'incoming'
  const campaignType = isIncoming ? 'inbound' : 'outbound'

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: 'active',
    campaignType: campaignType,
    // Outbound only fields
    startDate: '',
    endDate: '',
    phoneNumbers: [],
    // Settings
    settings: {
      callTimeout: isIncoming ? 45 : 30,
      // Outbound only settings
      maxCalls: '',
      retryAttempts: '',
      workingHours: {
        start: '09:00',
        end: '18:00',
        timezone: 'Asia/Kolkata'
      },
      voiceSettings: {
        voice: 'ash',
        speed: 1,
        language: 'hi-IN'
      }
    }
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [originalPhoneNumbers, setOriginalPhoneNumbers] = useState([]) // Store original numbers from CSV
  const [csvError, setCsvError] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const [popupError, setPopupError] = useState(null)
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState('') // Manual phone number input
  const [manualPhoneNumbersError, setManualPhoneNumbersError] = useState('')

  const categories = [
    'Real Estate',
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

  const timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST)' },
    { value: 'America/Denver', label: 'America/Denver (MST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'UTC', label: 'UTC' }
  ]

  const voices = [
    { value: 'ash', label: 'Ash' },
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' }
  ]

  const languages = [
    { value: 'hi-IN', label: 'Hindi (India)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const parts = name.split('.')
      if (parts.length === 2) {
        const [parent, child] = parts
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }))
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: type === 'checkbox' ? checked : value
            }
          }
        }))
      }
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

  const validatePhoneNumber = (phone) => {
    // Check if it's a valid phone number (10 digits or with country code)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.trim())
  }

  const handleCsvUpload = (e) => {
    try {
      if (!e || !e.target) {
        console.error('Invalid event object in handleCsvUpload')
        return
      }

      const file = e.target.files?.[0]

      if (!file) {
        return
      }

      if (!file.name || !file.name.toLowerCase().endsWith('.csv')) {
        setCsvError('Please upload a CSV file (.csv format)')
        setCsvFile(null)
        setCsvFileName('')
        setPhoneNumbers([])
        setOriginalPhoneNumbers([])
        return
      }

      setCsvFileName(file.name)
      setCsvError('')
      setCsvFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result
          if (!text || typeof text !== 'string') {
            setCsvError('Error reading file content')
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

          if (lines.length === 0) {
            setCsvError('CSV file is empty')
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          // Check if first line looks like a header
          const firstLine = lines[0]
          if (!firstLine) {
            setCsvError('CSV file format is invalid')
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          const cleanedFirstLine = firstLine.replace(/[^\d+]/g, '')
          if (!/^\+?[1-9]\d{1,14}$/.test(cleanedFirstLine)) {
            setCsvError('CSV file should not have a header row. First line should contain a phone number.')
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          // Validate all lines are phone numbers
          const validNumbers = []
          const originalNumbers = [] // Store original numbers without country code
          const invalidLines = []

          lines.forEach((line, index) => {
            try {
              // Clean the line: remove all non-digit characters except +
              const cleaned = line.replace(/[^\d+]/g, '')
              if (cleaned && validatePhoneNumber(cleaned)) {
                // Store original number (remove + if present, keep only digits)
                const originalNumber = cleaned.replace(/^\+/, '')
                if (originalNumber && !originalNumbers.includes(originalNumber)) {
                  originalNumbers.push(originalNumber)
                }

                // Format with + if not present and starts with country code (for campaign API)
                const formatted = cleaned.startsWith('+') ? cleaned : (cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`)
                if (formatted && !validNumbers.includes(formatted)) {
                  validNumbers.push(formatted)
                }
              } else {
                invalidLines.push(index + 1)
              }
            } catch (lineError) {
              console.error('Error processing line:', line, lineError)
              invalidLines.push(index + 1)
            }
          })

          if (invalidLines.length > 0) {
            setCsvError(`Invalid phone numbers found on lines: ${invalidLines.join(', ')}. Each line must contain a valid phone number.`)
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          if (validNumbers.length === 0) {
            setCsvError('No valid phone numbers found in the CSV file')
            setPhoneNumbers([])
            setOriginalPhoneNumbers([])
            return
          }

          setPhoneNumbers(validNumbers)
          setOriginalPhoneNumbers(originalNumbers) // Store original numbers
          setCsvError('')
        } catch (error) {
          console.error('Error parsing CSV:', error)
          setCsvError('Error reading CSV file. Please check the file format.')
          setPhoneNumbers([])
          setOriginalPhoneNumbers([])
        }
      }

      reader.onerror = () => {
        setCsvError('Error reading file. Please try again.')
        setPhoneNumbers([])
        setOriginalPhoneNumbers([])
        setCsvFile(null)
        setCsvFileName('')
      }

      reader.onabort = () => {
        setCsvError('File reading was aborted. Please try again.')
        setPhoneNumbers([])
        setOriginalPhoneNumbers([])
        setCsvFile(null)
        setCsvFileName('')
      }

      try {
        reader.readAsText(file)
      } catch (readError) {
        console.error('Error reading file:', readError)
        setCsvError('Error reading file. Please try again.')
        setPhoneNumbers([])
        setOriginalPhoneNumbers([])
        setCsvFile(null)
        setCsvFileName('')
      }
    } catch (error) {
      console.error('Error in handleCsvUpload:', error)
      setCsvError('Error uploading file. Please try again.')
      setPhoneNumbers([])
      setOriginalPhoneNumbers([])
      setCsvFile(null)
      setCsvFileName('')
    }
  }

  const handleRemoveCsv = () => {
    setCsvFile(null)
    setCsvFileName('')
    setPhoneNumbers([])
    setOriginalPhoneNumbers([])
    setCsvError('')
    const fileInput = document.getElementById('csvUpload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleDownloadSampleCsv = () => {
    // Create sample CSV content
    const sampleData = [
      '+919876543210',
      '+919876543211',
      '+919876543212',
      '+919876543213',
      '+919876543214'
    ]

    const csvContent = sampleData.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

    // Create download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'sample_phone_numbers.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

    // For outbound campaigns, validate required fields
    if (!isIncoming) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required for outbound campaigns'
      }

      if (!formData.endDate) {
        newErrors.endDate = 'End date is required for outbound campaigns'
      }

      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        if (start > end) {
          newErrors.endDate = 'End date must be after start date'
        }
      }

      // Check if either CSV file has phone numbers OR manual input has phone numbers
      const hasManualNumbers = manualPhoneNumbers && typeof manualPhoneNumbers === 'string' && manualPhoneNumbers.trim().length > 0
      if (phoneNumbers.length === 0 && !hasManualNumbers) {
        newErrors.phoneNumbers = 'Please upload a CSV file with phone numbers or enter phone numbers manually'
      }

      if (formData.settings.maxCalls && (isNaN(formData.settings.maxCalls) || formData.settings.maxCalls < 1)) {
        newErrors.maxCalls = 'Must be a positive number'
      }

      if (formData.settings.retryAttempts && (isNaN(formData.settings.retryAttempts) || formData.settings.retryAttempts < 0)) {
        newErrors.retryAttempts = 'Must be a non-negative number'
      }
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
      // Merge phone numbers from CSV and manual input
      let allPhoneNumbers = [...phoneNumbers]
      let allOriginalNumbers = [...originalPhoneNumbers]

      // Process manual phone numbers if provided
      if (manualPhoneNumbers && typeof manualPhoneNumbers === 'string' && manualPhoneNumbers.trim().length > 0) {
        try {
          const manualLines = manualPhoneNumbers.split('\n').map(line => line.trim()).filter(line => line.length > 0)
          
          manualLines.forEach(line => {
            try {
              const cleaned = line.replace(/[^\d+]/g, '')
              if (cleaned && validatePhoneNumber(cleaned)) {
                // Store original number (remove + if present, keep only digits)
                const originalNumber = cleaned.replace(/^\+/, '')
                if (originalNumber && !allOriginalNumbers.includes(originalNumber)) {
                  allOriginalNumbers.push(originalNumber)
                }

                // Format with + if not present and starts with country code (for campaign API)
                const formatted = cleaned.startsWith('+') ? cleaned : (cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`)
                if (formatted && !allPhoneNumbers.includes(formatted)) {
                  allPhoneNumbers.push(formatted)
                }
              }
            } catch (lineError) {
              console.error('Error processing phone number line:', line, lineError)
              // Continue processing other lines
            }
          })
        } catch (error) {
          console.error('Error processing manual phone numbers:', error)
          setErrors({ submit: 'Error processing manual phone numbers. Please check the format.' })
          setIsSubmitting(false)
          return
        }
      }

      // Prepare campaign data according to API structure
      const campaignPayload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        campaignType: campaignType,
        status: formData.status,
        settings: {
          callTimeout: parseInt(formData.settings.callTimeout) || (isIncoming ? 45 : 30),
          voiceSettings: {
            voice: formData.settings.voiceSettings.voice,
            speed: parseFloat(formData.settings.voiceSettings.speed) || 1,
            language: formData.settings.voiceSettings.language
          }
        }
      }

      // Add outbound-specific fields
      if (!isIncoming) {
        // Format dates to ISO 8601 with time
        const startDate = new Date(formData.startDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(formData.endDate)
        endDate.setHours(23, 59, 59, 999)

        campaignPayload.startDate = startDate.toISOString()
        campaignPayload.endDate = endDate.toISOString()
        campaignPayload.phoneNumbers = allPhoneNumbers.map(num => num.startsWith('+') ? num : `+${num}`)

        // Add outbound settings
        if (formData.settings.maxCalls) {
          campaignPayload.settings.maxCalls = parseInt(formData.settings.maxCalls)
        }
        if (formData.settings.retryAttempts !== '') {
          campaignPayload.settings.retryAttempts = parseInt(formData.settings.retryAttempts) || 0
        }
        campaignPayload.settings.workingHours = {
          start: formData.settings.workingHours.start,
          end: formData.settings.workingHours.end,
          timezone: formData.settings.workingHours.timezone
        }
      }

      // Debug: Log the campaign payload to verify phone numbers format
      console.log('Campaign Payload being sent to API:', JSON.stringify(campaignPayload, null, 2))

      // Call the API
      const response = await createCampaign(campaignPayload)

      if (response.success && response.data) {
        // Store the campaign ID and pass it to onSave
        const campaignId = response.data._id || response.data.id

        // Call datapush API for outbound campaigns with phone numbers
        if (!isIncoming && allOriginalNumbers.length > 0) {
          try {
            // Use original phone numbers (without country code) and join with comma and space
            const formattedPhoneNumbers = allOriginalNumbers.join(', ')

            // Build the datapush API URL
            const datapushUrl = new URL('http://180.150.249.216/webapi/datapush')
            datapushUrl.searchParams.append('username', 'testapi1@api.com')
            datapushUrl.searchParams.append('password', '123@123')
            datapushUrl.searchParams.append('phonenumber', formattedPhoneNumbers)
            datapushUrl.searchParams.append('callerid', 'fixed')
            // Use voiceId from user profile or default to '5628'
            datapushUrl.searchParams.append('voiceid', user?.voiceId || '5628')
            // Include aiProjectId if available in user profile
            if (user?.aiProjectId) {
              datapushUrl.searchParams.append('aiprojectid', user.aiProjectId)
            }

            // Call the datapush API
            const datapushResponse = await fetch(datapushUrl.toString(), {
              method: 'GET'
            })

            const datapushData = await datapushResponse.json()
            console.log('Datapush API response:', datapushData)
          } catch (datapushError) {
            // Log error but don't fail the campaign creation
            console.error('Error calling datapush API:', datapushError)
          }
        }

        await onSave({
          ...campaignPayload,
          _id: campaignId,
          id: campaignId
        })
      } else {
        throw new Error(response.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)

      // Check if error is related to unique campaign name
      const errorData = error.response?.data || {}
      const errorMessage = error.response?.error || error.message || 'Failed to create campaign. Please try again.'
      const errorDetails = error.response?.details || []

      const isUniqueNameError = errorData.error?.toLowerCase().includes('unique') ||
        errorData.error?.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('unique') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('duplicate') ||
        (errorDetails.length > 0 && errorDetails[0]?.toLowerCase().includes('already exists'))

      if (isUniqueNameError) {
        // Set error on the name field for unique name validation with professional message
        setErrors({
          name: 'Campaign Name Already Exists. Try Different Campaign Name.'
        })
        // Show popup notification
        setPopupError('Campaign Name Already Exists. Try Different Campaign Name.')
      } else {
        // Show generic error message for other errors
        setErrors({ submit: errorMessage })
      }
    } finally {
      setIsSubmitting(false)
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
                    Create {isIncoming ? 'Inbound' : 'Outbound'} Campaign
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-secondary-300'
                    }`}
                  placeholder="e.g., SS Cendana Property Outreach"
                  required
                />
                {errors.name && (
                  <div className="mt-2 flex items-start space-x-2 bg-red-50 border border-red-200 rounded-md p-3">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{errors.name}</p>
                  </div>
                )}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.category ? 'border-red-500' : 'border-secondary-300'
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-secondary-300'
                    }`}
                  placeholder="Describe the purpose and goals of this campaign..."
                  required
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Outbound only: Start Date and End Date */}
              {!isIncoming && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.startDate ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      required
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.endDate ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      required
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                </div>
              )}

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
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
                <p className="mt-1 text-xs text-secondary-500">
                  Campaign will be {formData.status === 'active' ? 'active' : 'paused'} upon creation
                </p>
              </div>
            </div>
          </div>

          {/* Phone Numbers Upload - Only for Outbound Campaigns */}
          {!isIncoming && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <PhoneOutgoing className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-secondary-900">Phone Numbers</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="csvUpload" className="block text-sm font-medium text-secondary-700 mb-2">
                    Upload Phone Numbers (CSV) <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      <label
                        htmlFor="csvUpload"
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload CSV File</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
                        title="Download sample CSV file"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Sample CSV</span>
                      </button>
                      <input
                        type="file"
                        id="csvUpload"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        className="hidden"
                      />
                      {csvFileName && (
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-secondary-500" />
                          <span className="text-sm text-secondary-700 truncate">{csvFileName}</span>
                          <button
                            type="button"
                            onClick={handleRemoveCsv}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* CSV Format Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">CSV File Requirements:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>File must be in .csv format</li>
                            <li>No header row - first line should contain a phone number</li>
                            <li>Each line must contain a valid phone number (with or without country code)</li>
                            <li>Click "Download Sample CSV" above to get a template file</li>
                            <li>Example format:</li>
                          </ul>
                          <div className="mt-2 bg-white p-2 rounded border border-blue-200 font-mono text-xs">
                            9876543210<br />
                            9876543211<br />
                            9876543212
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Success Message */}
                    {phoneNumbers.length > 0 && !csvError && (
                      <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                        <CheckCircle className="w-4 h-4" />
                        <span>Successfully loaded {phoneNumbers.length} phone number{phoneNumbers.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {csvError && (
                      <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{csvError}</span>
                      </div>
                    )}

                    {/* Validation Error */}
                    {errors.phoneNumbers && (
                      <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{errors.phoneNumbers}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Phone Number Input */}
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <label htmlFor="manualPhoneNumbers" className="block text-sm font-medium text-secondary-700 mb-2">
                    Or Enter Phone Numbers Manually
                  </label>
                  
                  <div className="space-y-3">
                    <textarea
                      id="manualPhoneNumbers"
                      value={manualPhoneNumbers || ''}
                      onChange={(e) => {
                        try {
                          if (!e || !e.target) {
                            console.error('Invalid event object in manual phone number input')
                            return
                          }
                          const value = e.target?.value || ''
                          setManualPhoneNumbers(value)
                          setManualPhoneNumbersError('')
                        } catch (error) {
                          console.error('Error in manual phone number input:', error)
                          setManualPhoneNumbersError('Error processing input')
                        }
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder="Enter phone numbers, one per line&#10;Example:&#10;9876543210&#10;9876543211&#10;+919876543212"
                    />
                    
                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Manual Input Instructions:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Enter one phone number per line</li>
                            <li>Press Enter to add a new line for the next number</li>
                            <li>Phone numbers can be with or without country code</li>
                            <li>Numbers from both CSV and manual input will be merged</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Success Message for Manual Input */}
                    {manualPhoneNumbers && typeof manualPhoneNumbers === 'string' && manualPhoneNumbers.trim().length > 0 && !manualPhoneNumbersError && (
                      <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {manualPhoneNumbers.split('\n').filter(line => line && line.trim().length > 0).length} phone number(s) entered manually
                        </span>
                      </div>
                    )}

                    {/* Combined Total */}
                    {(phoneNumbers.length > 0 || (manualPhoneNumbers && typeof manualPhoneNumbers === 'string' && manualPhoneNumbers.trim().length > 0)) && (
                      <div className="flex items-center space-x-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-md p-3">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">
                          Total: {phoneNumbers.length + (manualPhoneNumbers ? manualPhoneNumbers.split('\n').filter(line => line && line.trim().length > 0).length : 0)} phone number(s) will be added to the campaign
                        </span>
                      </div>
                    )}

                    {/* Error Message for Manual Input */}
                    {manualPhoneNumbersError && (
                      <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{manualPhoneNumbersError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Settings</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="callTimeout" className="block text-sm font-medium text-secondary-700 mb-1">
                  Call Timeout (seconds)
                </label>
                <input
                  type="number"
                  id="callTimeout"
                  name="settings.callTimeout"
                  value={formData.settings.callTimeout}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={isIncoming ? "45" : "30"}
                />
                <p className="mt-1 text-xs text-secondary-500">Default: {isIncoming ? '45' : '30'} seconds</p>
              </div>

              {/* Outbound only settings */}
              {!isIncoming && (
                <>
                  <div>
                    <label htmlFor="maxCalls" className="block text-sm font-medium text-secondary-700 mb-1">
                      Max Calls
                    </label>
                    <input
                      type="number"
                      id="maxCalls"
                      name="settings.maxCalls"
                      value={formData.settings.maxCalls}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.maxCalls ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      placeholder="e.g., 100"
                    />
                    {errors.maxCalls && <p className="mt-1 text-sm text-red-600">{errors.maxCalls}</p>}
                  </div>

                  <div>
                    <label htmlFor="retryAttempts" className="block text-sm font-medium text-secondary-700 mb-1">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      id="retryAttempts"
                      name="settings.retryAttempts"
                      value={formData.settings.retryAttempts}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.retryAttempts ? 'border-red-500' : 'border-secondary-300'
                        }`}
                      placeholder="e.g., 2"
                    />
                    {errors.retryAttempts && <p className="mt-1 text-sm text-red-600">{errors.retryAttempts}</p>}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-secondary-900 mb-3">Working Hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="workingHoursStart" className="block text-sm font-medium text-secondary-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="workingHoursStart"
                          name="settings.workingHours.start"
                          value={formData.settings.workingHours.start}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="workingHoursEnd" className="block text-sm font-medium text-secondary-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          id="workingHoursEnd"
                          name="settings.workingHours.end"
                          value={formData.settings.workingHours.end}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="workingHoursTimezone" className="block text-sm font-medium text-secondary-700 mb-1">
                          Timezone
                        </label>
                        <select
                          id="workingHoursTimezone"
                          name="settings.workingHours.timezone"
                          value={formData.settings.workingHours.timezone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {timezones.map(tz => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Voice Settings</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="voice" className="block text-sm font-medium text-secondary-700 mb-1">
                    Voice
                  </label>
                  <select
                    id="voice"
                    name="settings.voiceSettings.voice"
                    value={formData.settings.voiceSettings.voice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {voices.map(voice => (
                      <option key={voice.value} value={voice.value}>{voice.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="speed" className="block text-sm font-medium text-secondary-700 mb-1">
                    Speed
                  </label>
                  <input
                    type="number"
                    id="speed"
                    name="settings.voiceSettings.speed"
                    value={formData.settings.voiceSettings.speed}
                    onChange={handleChange}
                    min="0.5"
                    max="2"
                    step="0.1"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-secondary-700 mb-1">
                    Language
                  </label>
                  <select
                    id="language"
                    name="settings.voiceSettings.language"
                    value={formData.settings.voiceSettings.language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Popup */}
      {popupError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{popupError}</p>
            </div>
            <button
              onClick={() => setPopupError(null)}
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

export default CreateCampaign
