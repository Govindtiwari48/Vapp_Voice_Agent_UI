import { useState, useEffect } from 'react'
import { AlertTriangle, Clock } from 'lucide-react'

function SessionWarning({ isVisible, onExtend, onLogout, remainingTime }) {
  const [countdown, setCountdown] = useState(Math.floor(remainingTime / 1000))

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, onLogout])

  useEffect(() => {
    setCountdown(Math.floor(remainingTime / 1000))
  }, [remainingTime])

  if (!isVisible) return null

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900">Session Expiring Soon</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-secondary-600 mb-3">
            Your session will expire due to inactivity. You will be logged out automatically in:
          </p>
          <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-mono text-lg">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-secondary-200 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-300 transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionWarning