import { useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Home,
  Link2,
  Upload,
  FileText,
  PhoneIncoming,
  PhoneOutgoing,
  Languages,
  ListChecks,
  Save,
  X
} from 'lucide-react'

const languageOptions = [
  { label: 'Hinglish', value: 'hinglish' },
  { label: 'English', value: 'english' },
  { label: 'Gujarati', value: 'gujarati' },
  { label: 'Marathi', value: 'marathi' },
  { label: 'Kannada', value: 'kannada' },
  { label: 'Tamil', value: 'tamil' },
  { label: 'Telugu', value: 'telugu' },
  { label: 'Bangla', value: 'bangla' }
]

const MAX_LANGUAGES = 4

const dispositionPresets = [
  'Exchange Number',
  'Just having Conversation',
  'Connect Sales',
  'Site Visit',
  'Seeking Details'
]

const ProjectTraining = ({ onBack, onHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    callFlowInbound: '',
    callFlowOutbound: '',
    defaultLanguages: languageOptions.slice(0, MAX_LANGUAGES).map((item, index) => ({ ...item, order: index + 1 })),
    successfulDisposition: ['Exchange Number', 'Connect Sales'],
    notes: ''
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleToggleLanguage = (language) => {
    setFormData((prev) => {
      const exists = prev.defaultLanguages.some((item) => item.value === language.value)
      if (exists) {
        const updatedLanguages = prev.defaultLanguages
          .filter((item) => item.value !== language.value)
          .map((item, index) => ({ ...item, order: index + 1 }))
        return {
          ...prev,
          defaultLanguages: updatedLanguages
        }
      }

      if (prev.defaultLanguages.length >= MAX_LANGUAGES) {
        return prev
      }

      const updatedLanguages = [
        ...prev.defaultLanguages,
        { ...language, order: prev.defaultLanguages.length + 1 }
      ]

      return {
        ...prev,
        defaultLanguages: updatedLanguages
      }
    })
  }

  const moveLanguage = (value, direction) => {
    setFormData((prev) => {
      const currentIndex = prev.defaultLanguages.findIndex((language) => language.value === value)
      if (currentIndex === -1) return prev

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= prev.defaultLanguages.length) return prev

      const updatedLanguages = [...prev.defaultLanguages]
      const [removed] = updatedLanguages.splice(currentIndex, 1)
      updatedLanguages.splice(targetIndex, 0, removed)

      return {
        ...prev,
        defaultLanguages: updatedLanguages.map((language, index) => ({ ...language, order: index + 1 }))
      }
    })
  }

  const handleDispositionToggle = (label) => {
    setFormData((prev) => {
      const exists = prev.successfulDisposition.includes(label)
      return {
        ...prev,
        successfulDisposition: exists
          ? prev.successfulDisposition.filter((item) => item !== label)
          : [...prev.successfulDisposition, label]
      }
    })
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-600" />
          </button>
          <button
            onClick={onHome}
            className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors"
            aria-label="Home"
          >
            <Home className="w-5 h-5 text-secondary-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Section</p>
            <h1 className="text-xl font-semibold text-secondary-900">Project Training</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-secondary-200 pb-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary-500">Saved Project</p>
              <h2 className="text-lg font-semibold text-secondary-900">Sales Pitch + Call Flows</h2>
            </div>
            <div className="text-sm text-secondary-500">
              Edit | Add / remove training info, delete project, change language or flows
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-700">
            <div className="bg-secondary-50 rounded-xl p-4">
              <p className="font-semibold mb-1">Training Data</p>
              <p className="text-secondary-500 text-sm">Paste project links, upload PDFs or drop Google Docs.</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <p className="font-semibold mb-1">AI Pitch</p>
              <p className="text-secondary-500 text-sm">Our system can generate exhaustive sales scripts via GPT-5.</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <p className="font-semibold mb-1">Flows</p>
              <p className="text-secondary-500 text-sm">Keep inbound/outbound steps aligned with your SOPs.</p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">New Projects</p>
            <h3 className="text-lg font-semibold text-secondary-900">Upload PDF or paste information</h3>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-secondary-500 uppercase">Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 input"
                placeholder="Enter project nickname"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-secondary-500 uppercase">Paste Project Link</span>
              <div className="mt-1 flex items-center space-x-2">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Link2 className="w-4 h-4 text-primary-600" />
                </div>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  className="flex-1 input"
                  placeholder="https://docs.google.com/..."
                />
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-secondary-500 uppercase flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-primary-600" />
                  <span>Upload PDF or Paste Information</span>
                </span>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                  className="mt-1 textarea"
                  placeholder="Drop important positioning statements, FAQs, offers..."
                />
              </label>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-secondary-500 uppercase flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <span>Attach Supporting Docs</span>
                  </span>
                  <button className="mt-2 w-full btn-secondary text-sm">Choose PDF / DOCX</button>
                </div>

                <div>
                  <p className="text-xs font-semibold text-secondary-500 uppercase">Successful Disposition</p>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {dispositionPresets.map((label) => {
                      const active = formData.successfulDisposition.includes(label)
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleDispositionToggle(label)}
                          className={`px-3 py-2 rounded-lg text-left text-sm border ${
                            active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-secondary-500 uppercase flex items-center space-x-2">
                  <PhoneIncoming className="w-4 h-4 text-green-600" />
                  <span>Inbound Call Flow</span>
                </span>
                <textarea
                  value={formData.callFlowInbound}
                  onChange={(e) => handleChange('callFlowInbound', e.target.value)}
                  rows={5}
                  className="mt-1 textarea"
                  placeholder="Step 1: Greeting
Step 2: Qualify budget/location
Step 3: Capture intent
Step 4: Offer follow-up"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-secondary-500 uppercase flex items-center space-x-2">
                  <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                  <span>Outbound Call Flow</span>
                </span>
                <textarea
                  value={formData.callFlowOutbound}
                  onChange={(e) => handleChange('callFlowOutbound', e.target.value)}
                  rows={5}
                  className="mt-1 textarea"
                  placeholder="Step 1: Warm intro
Step 2: Reference trigger
Step 3: Pitch offer
Step 4: CTA / schedule"
                />
              </label>
            </div>

            <div className="card border border-dashed border-primary-100 bg-primary-50/40 p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Languages className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary-600">Default Language</p>
                  <p className="text-sm text-secondary-700">Define order of preferred languages</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs text-secondary-500 uppercase font-semibold">Choose up to 4 languages</p>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((language) => {
                      const isSelected = formData.defaultLanguages.some((item) => item.value === language.value)
                      const disabled = !isSelected && formData.defaultLanguages.length >= MAX_LANGUAGES
                      return (
                        <button
                          key={language.value}
                          type="button"
                          onClick={() => handleToggleLanguage(language)}
                          disabled={disabled}
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1 ${
                            isSelected
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-secondary-200 text-secondary-600 hover:text-secondary-900'
                          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>{language.label}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {formData.defaultLanguages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-secondary-500 uppercase font-semibold">Set preferred order</p>
                    <div className="space-y-2">
                      {formData.defaultLanguages.map((language, index) => (
                        <div
                          key={language.value}
                          className="flex items-center space-x-3 bg-white rounded-lg border border-primary-100 p-3"
                        >
                          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                            <ListChecks className="w-4 h-4" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-semibold">
                            {language.order}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-secondary-900">{language.label}</p>
                            <p className="text-xs text-secondary-500">Preferred language #{language.order}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveLanguage(language.value, 'up')}
                              disabled={index === 0}
                              className="p-2 rounded-lg border border-secondary-200 text-secondary-600 disabled:opacity-30"
                              aria-label="Move language up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLanguage(language.value, 'down')}
                              disabled={index === formData.defaultLanguages.length - 1}
                              className="p-2 rounded-lg border border-secondary-200 text-secondary-600 disabled:opacity-30"
                              aria-label="Move language down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleLanguage(language)}
                              className="p-2 rounded-lg border border-secondary-200 text-red-600 hover:bg-red-50"
                              aria-label="Remove language"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-secondary-200">
            <p className="text-xs text-secondary-500">Save project to sync configurations with inbound & outbound campaigns.</p>
            <button className="btn-primary inline-flex items-center space-x-2 text-sm font-semibold">
              <Save className="w-4 h-4" />
              <span>Save Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectTraining


