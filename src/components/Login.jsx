import { useState } from 'react'
import { Phone, AlertCircle, Loader2 } from 'lucide-react'
import { signup, login, setToken, setUser } from '../api/auth'

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isSignup) {
        // Handle signup
        const signupData = {
          email,
          password,
          firstName,
          lastName,
          phone
        }
        
        const response = await signup(signupData)
        
        if (response.user) {
          setSuccess('Account created successfully! Please login.')
          // Reset form
          setEmail('')
          setPassword('')
          setFirstName('')
          setLastName('')
          setPhone('')
          // Switch to login mode
          setIsSignup(false)
        }
      } else {
        // Handle login
        const loginData = {
          email,
          password
        }
        
        const response = await login(loginData)
        
        if (response.token && response.user) {
          // Store token and user data
          setToken(response.token)
          setUser(response.user)
          localStorage.setItem('isAuthenticated', 'true')
          
          // Call onLogin callback to update parent state
          onLogin(response.user)
        }
      }
    } catch (err) {
      setError(err.message || (isSignup ? 'Signup failed. Please try again.' : 'Login failed. Please check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setSuccess('')
    // Clear form when switching modes
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Voice Agent</h1>
          <p className="text-secondary-600">Control Panel</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            {isSignup ? 'Create Account' : 'Sign In'}
          </h2>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name Field (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  placeholder="Enter your first name"
                  required
                />
              </div>
            )}

            {/* Last Name Field (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            )}

            {/* Phone Field (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Account' : 'Sign In')}</span>
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login



