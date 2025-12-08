/**
 * Session Management Utility
 * Handles automatic logout after inactivity period
 */

import { clearAuth } from '../api/auth'

class SessionManager {
  constructor() {
    this.timeoutDuration = 5 * 60 * 1000 // 5 minutes in milliseconds
    this.warningDuration = 30 * 1000 // Show warning 30 seconds before logout
    this.timeoutId = null
    this.warningTimeoutId = null
    this.onLogout = null
    this.onWarning = null
    this.isActive = false
    
    // Events that indicate user activity
    this.activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]
    
    // Throttled activity handler to prevent excessive timeout resets
    this.handleActivity = this.throttle(this.resetTimeout.bind(this), 1000)
  }

  /**
   * Start session monitoring
   * @param {Function} logoutCallback - Function to call when session expires
   * @param {Function} warningCallback - Function to call when session warning should be shown
   */
  start(logoutCallback, warningCallback = null) {
    this.onLogout = logoutCallback
    this.onWarning = warningCallback
    this.isActive = true
    
    // Set initial timeout
    this.resetTimeout()
    
    // Add event listeners for user activity
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true)
    })
    
    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * Stop session monitoring
   */
  stop() {
    this.isActive = false
    
    // Clear timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId)
      this.warningTimeoutId = null
    }
    
    // Remove event listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true)
    })
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * Reset the inactivity timeout
   */
  resetTimeout() {
    if (!this.isActive) return
    
    // Clear existing timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId)
    }
    
    // Set warning timeout
    if (this.onWarning) {
      this.warningTimeoutId = setTimeout(() => {
        this.showWarning()
      }, this.timeoutDuration - this.warningDuration)
    }
    
    // Set logout timeout
    this.timeoutId = setTimeout(() => {
      this.logout()
    }, this.timeoutDuration)
  }

  /**
   * Handle visibility change (tab switching)
   */
  handleVisibilityChange() {
    if (!document.hidden && this.isActive) {
      // Tab is visible again, reset timeout
      this.resetTimeout()
    }
  }

  /**
   * Show session warning
   */
  showWarning() {
    if (!this.isActive) return
    
    if (this.onWarning) {
      this.onWarning(this.warningDuration)
    }
  }

  /**
   * Extend session (called when user clicks "Stay Logged In")
   */
  extendSession() {
    this.resetTimeout()
  }

  /**
   * Perform logout
   */
  logout() {
    if (!this.isActive) return
    
    // Clear authentication data
    clearAuth()
    
    // Stop monitoring
    this.stop()
    
    // Call logout callback
    if (this.onLogout) {
      this.onLogout()
    }
  }

  /**
   * Throttle function to limit how often a function can be called
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   */
  throttle(func, delay) {
    let timeoutId
    let lastExecTime = 0
    
    return function(...args) {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  /**
   * Get remaining time until logout
   * @returns {number} Remaining time in milliseconds
   */
  getRemainingTime() {
    if (!this.timeoutId || !this.isActive) return 0
    
    // This is an approximation since we can't directly access setTimeout's remaining time
    return this.timeoutDuration
  }

  /**
   * Check if session is active
   * @returns {boolean} True if session monitoring is active
   */
  isSessionActive() {
    return this.isActive && this.timeoutId !== null
  }
}

// Create and export singleton instance
const sessionManager = new SessionManager()
export default sessionManager