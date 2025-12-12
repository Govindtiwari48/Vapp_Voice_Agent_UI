import { useState, useEffect } from 'react'
import { ArrowLeft, Home, Wallet, CreditCard, IndianRupee, TrendingUp, ShieldCheck, Gift, DollarSign, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getCreditBalance, getCreditTransactions, topUpCredits, configureAutoTopup, getCreditSpending } from '../api'

const presetAmounts = [5000, 10000, 25000, 50000]

const WalletTopUp = ({ onBack, onHome, onBalanceUpdate }) => {
  const [selectedAmount, setSelectedAmount] = useState(10000)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('INR')
  const [loading, setLoading] = useState(true)
  const [balanceData, setBalanceData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [spendingData, setSpendingData] = useState({ days: 30, avgDailySpend: 0, totalCost: 0 })
  const [autoTopupSettings, setAutoTopupSettings] = useState({ enabled: false, threshold: 0, amount: 0 })
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showTransactions, setShowTransactions] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      
      // Fetch all wallet data in parallel
      const [balanceResponse, transactionsResponse, spendingResponse] = await Promise.all([
        getCreditBalance(),
        getCreditTransactions({ limit: 50 }),
        getCreditSpending({ days: 30 })
      ])

      if (balanceResponse.success) {
        setBalanceData(balanceResponse.data)
        setAutoTopupSettings(balanceResponse.data.autoTopup || { enabled: false, threshold: 0, amount: 0 })
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || [])
      }

      if (spendingResponse.success) {
        setSpendingData(spendingResponse.data)
      }
    } catch (error) {
      console.error('Error loading wallet data:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to load wallet data' })
    } finally {
      setLoading(false)
    }
  }

  const handleCustomAmount = (value) => {
    setCustomAmount(value)
    const numeric = Number(value)
    if (!Number.isNaN(numeric) && numeric > 0) {
      setSelectedAmount(numeric)
    }
  }

  const handleTopUp = async () => {
    if (selectedAmount < 1000 && selectedCurrency === 'INR') {
      setMessage({ type: 'error', text: 'Minimum top-up amount is ₹1,000' })
      return
    }

    if (selectedAmount < 10 && selectedCurrency === 'USD') {
      setMessage({ type: 'error', text: 'Minimum top-up amount is $10' })
      return
    }

    try {
      setProcessing(true)
      setMessage({ type: '', text: '' })

      const response = await topUpCredits({
        amount: selectedAmount,
        currency: selectedCurrency,
        method: 'manual'
      })

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully added ${formatCurrency(response.data.amount, selectedCurrency)}${response.data.bonus > 0 ? ` + ${formatCurrency(response.data.bonus, selectedCurrency)} bonus` : ''}. New balance: ${formatCurrency(response.data.balance, response.data.currency)}`
        })
        
        // Reload wallet data
        await loadWalletData()
        
        // Update balance in parent component
        if (onBalanceUpdate) {
          onBalanceUpdate()
        }
        
        // Reset form
        setSelectedAmount(10000)
        setCustomAmount('')
      }
    } catch (error) {
      console.error('Error processing top-up:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to process top-up' })
    } finally {
      setProcessing(false)
    }
  }

  const handleAutoTopupToggle = async (enabled) => {
    try {
      setProcessing(true)
      setMessage({ type: '', text: '' })

      const settings = enabled 
        ? { enabled: true, threshold: 2000, amount: 10000 }
        : { enabled: false, threshold: 0, amount: 0 }

      const response = await configureAutoTopup(settings)

      if (response.success) {
        setAutoTopupSettings(response.data.autoTopup)
        setMessage({ 
          type: 'success', 
          text: enabled ? 'Auto top-up enabled successfully' : 'Auto top-up disabled successfully'
        })
        
        // Reload balance data
        await loadWalletData()
        
        // Update balance in parent component
        if (onBalanceUpdate) {
          onBalanceUpdate()
        }
      }
    } catch (error) {
      console.error('Error updating auto top-up:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update auto top-up settings' })
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (value, currency = 'INR') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
  }

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const calculateBonus = (amount) => {
    if (amount >= 100000) return amount * 0.08
    if (amount >= 25000) return amount * 0.08
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">Loading wallet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-secondary-600" />
              </button>
              <button
                onClick={onHome}
                className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0"
                aria-label="Home"
              >
                <Home className="w-5 h-5 text-secondary-600" />
              </button>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-secondary-500">Section</p>
                <h1 className="text-xl font-semibold text-secondary-900">Add Call Credits</h1>
              </div>
            </div>
            <button
              onClick={loadWalletData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-secondary-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 space-y-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Current Balance</p>
            <h3 className="text-2xl font-semibold text-secondary-900">
              {balanceData ? formatCurrency(balanceData.balance, balanceData.currency) : 'Loading...'}
            </h3>
            <p className="text-xs text-secondary-500">{balanceData?.currency || 'INR'}</p>
          </div>
          <div className="card p-4 space-y-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Avg Daily Spend</p>
            <h3 className="text-2xl font-semibold text-secondary-900">
              {formatCurrency(spendingData.avgDailySpend, balanceData?.currency || 'INR')}
            </h3>
            <p className="text-xs text-secondary-500">Last {spendingData.days} days usage</p>
          </div>
          <div className="card p-4 space-y-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Auto-Top Up</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-secondary-900">
                {autoTopupSettings.enabled ? 'Enabled' : 'Disabled'}
              </h3>
              <button
                onClick={() => handleAutoTopupToggle(!autoTopupSettings.enabled)}
                disabled={processing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoTopupSettings.enabled ? 'bg-primary-600' : 'bg-secondary-300'
                } ${processing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoTopupSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {autoTopupSettings.enabled && (
              <p className="text-xs text-secondary-500">
                Tops up {formatCurrency(autoTopupSettings.amount, balanceData?.currency || 'INR')} when balance falls below {formatCurrency(autoTopupSettings.threshold, balanceData?.currency || 'INR')}
              </p>
            )}
            {!autoTopupSettings.enabled && (
              <p className="text-xs text-secondary-500">Enable to auto-recharge when low</p>
            )}
          </div>
        </div>

        <div className="card p-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Choose Amount</p>
            <h3 className="text-lg font-semibold text-secondary-900">Keep AI agent funded</h3>
          </div>

          {/* Currency Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCurrency('INR')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCurrency === 'INR'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              <IndianRupee className="w-4 h-4 inline mr-1" />
              INR
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCurrency === 'USD'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-1" />
              USD
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                disabled={processing}
                className={`border rounded-xl p-3 text-left hover:border-primary-400 transition-colors ${
                  selectedAmount === amount && customAmount === '' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="text-xs text-secondary-500">Recharge</p>
                <p className="text-lg font-semibold text-secondary-900">{formatCurrency(amount, selectedCurrency)}</p>
                {calculateBonus(amount) > 0 && (
                  <p className="text-xs text-green-600 mt-1">+{formatCurrency(calculateBonus(amount), selectedCurrency)} bonus</p>
                )}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-secondary-500 uppercase">Custom Amount</span>
            <div className="mt-1 flex items-center border border-secondary-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-secondary-100 text-secondary-600 text-sm font-semibold flex items-center space-x-1">
                {selectedCurrency === 'INR' ? (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    <span>INR</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span>USD</span>
                  </>
                )}
              </div>
              <input
                type="number"
                min={selectedCurrency === 'INR' ? '1000' : '10'}
                step={selectedCurrency === 'INR' ? '500' : '10'}
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                disabled={processing}
                className="flex-1 input border-none rounded-none"
              />
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-primary-600" />
                <p className="text-sm font-semibold text-secondary-900">Payment Method</p>
              </div>
              <p className="text-xs text-secondary-500">Manual Credit Addition</p>
              <p className="text-xs text-secondary-400">Contact admin to add credits</p>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-primary-600" />
                <p className="text-sm font-semibold text-primary-900">Bonus Credits</p>
              </div>
              <p className="text-xs text-primary-800">
                Recharge above {formatCurrency(25000, selectedCurrency)} to unlock 8% bonus credits.
              </p>
              {selectedAmount >= 25000 && (
                <p className="text-xs font-semibold text-green-700">
                  You'll get {formatCurrency(calculateBonus(selectedAmount), selectedCurrency)} bonus!
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-secondary-500">
                Amount payable: <span className="font-semibold text-secondary-900">{formatCurrency(selectedAmount, selectedCurrency)}</span>
              </p>
              {calculateBonus(selectedAmount) > 0 && (
                <p className="text-xs text-green-600">
                  Total credits: <span className="font-semibold">{formatCurrency(selectedAmount + calculateBonus(selectedAmount), selectedCurrency)}</span>
                </p>
              )}
            </div>
            <button 
              onClick={handleTopUp}
              disabled={processing || selectedAmount < (selectedCurrency === 'INR' ? 1000 : 10)}
              className="btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Add Credits</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Transaction History */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-secondary-500">Transaction History</p>
              <h3 className="text-lg font-semibold text-secondary-900">Recent Credits Activity</h3>
            </div>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {showTransactions ? 'Hide' : 'Show'} Transactions
            </button>
          </div>

          {showTransactions && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-secondary-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionStatusIcon(transaction.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-secondary-900">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            {transaction.bonusApplied > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                +{formatCurrency(transaction.bonusApplied, transaction.currency)} bonus
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-secondary-500">
                            {transaction.method} • {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          transaction.status === 'success' 
                            ? 'bg-green-100 text-green-700'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status}
                        </span>
                        <p className="text-xs text-secondary-500 mt-1">
                          {transaction.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletTopUp


