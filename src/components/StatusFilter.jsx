import { useState } from 'react'
import { Filter } from 'lucide-react'

/**
 * StatusFilter - A reusable filter component for status-based filtering
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of filter options { label: string, value: string }
 * @param {string} props.selectedValue - Currently selected filter value
 * @param {Function} props.onChange - Callback function when filter changes (value) => void
 * @param {string} props.label - Optional label for the filter
 * @param {boolean} props.showAllOption - Whether to show "All" option (default: true)
 * @param {string} props.allOptionLabel - Label for "All" option (default: "All")
 * @param {string} props.allOptionValue - Value for "All" option (default: "")
 * @param {boolean} props.disabled - Whether the filter is disabled
 * @param {string} props.className - Additional CSS classes
 */
const StatusFilter = ({
  options = [],
  selectedValue = '',
  onChange,
  label = 'Filter by Status',
  showAllOption = true,
  allOptionLabel = 'All',
  allOptionValue = '',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (value) => {
    if (onChange) {
      onChange(value)
    }
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === selectedValue) ||
    (showAllOption && selectedValue === allOptionValue ? { label: allOptionLabel } : null)

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap
          ${disabled
            ? 'bg-secondary-100 border-secondary-200 text-secondary-400 cursor-not-allowed'
            : selectedValue && selectedValue !== allOptionValue
              ? 'bg-primary-50 border-primary-300 text-primary-700 hover:bg-primary-100'
              : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300'
          }
        `}
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Filter className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          {selectedOption ? selectedOption.label : label}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-secondary-200 z-20 max-h-60 overflow-auto">
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSelect(allOptionValue)}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${selectedValue === allOptionValue
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-secondary-700 hover:bg-secondary-50'
                  }
                `}
              >
                {allOptionLabel}
              </button>
            )}

            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-secondary-100 first:border-t-0
                  ${selectedValue === option.value
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-secondary-700 hover:bg-secondary-50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default StatusFilter

