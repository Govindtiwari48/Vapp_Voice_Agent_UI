import { useState } from 'react'
import { ArrowLeft, Home, Wallet, CreditCard, IndianRupee, TrendingUp, ShieldCheck, Gift } from 'lucide-react'

const presetAmounts = [5000, 10000, 25000, 50000]

const WalletTopUp = ({ onBack, onHome }) => {
  const [selectedAmount, setSelectedAmount] = useState(10000)
  const [customAmount, setCustomAmount] = useState('')

  const handleCustomAmount = (value) => {
    setCustomAmount(value)
    const numeric = Number(value)
    if (!Number.isNaN(numeric) && numeric > 0) {
      setSelectedAmount(numeric)
    }
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

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
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 space-y-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Current Balance</p>
            <h3 className="text-2xl font-semibold text-secondary-900">NA</h3>
            <p className="text-xs text-secondary-500">NA</p>
          </div>
          <div className="card p-4 space-y-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Avg Daily Spend</p>
            <h3 className="text-2xl font-semibold text-secondary-900">NA</h3>
            <p className="text-xs text-secondary-500">Includes inbound + outbound usage</p>
          </div>
          <div className="card p-4 space-y-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <p className="text-xs uppercase tracking-wide text-secondary-500">Auto-Top Up</p>
            <h3 className="text-lg font-semibold text-secondary-900">NA</h3>
            <p className="text-xs text-secondary-500">Pause anytime from billing settings</p>
          </div>
        </div>

        <div className="card p-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Choose Amount</p>
            <h3 className="text-lg font-semibold text-secondary-900">Keep AI agent funded</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                className={`border rounded-xl p-3 text-left hover:border-primary-400 transition-colors ${selectedAmount === amount && customAmount === '' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'
                  }`}
              >
                <p className="text-xs text-secondary-500">Recharge</p>
                <p className="text-lg font-semibold text-secondary-900">{formatCurrency(amount)}</p>
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-secondary-500 uppercase">Custom Amount</span>
            <div className="mt-1 flex items-center border border-secondary-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-secondary-100 text-secondary-600 text-sm font-semibold flex items-center space-x-1">
                <IndianRupee className="w-4 h-4" />
                <span>INR</span>
              </div>
              <input
                type="number"
                min="1000"
                step="500"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
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
              <p className="text-xs text-secondary-500">NA</p>
              <button className="btn-secondary w-full text-sm">Change / Add Card</button>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-primary-600" />
                <p className="text-sm font-semibold text-primary-900">Bonus Minutes</p>
              </div>
              <p className="text-xs text-primary-800">
                Recharge above ₹25,000 to unlock 8% bonus credits & free GPT-5 pitch refresh.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-secondary-500">Amount payable: <span className="font-semibold text-secondary-900">{formatCurrency(selectedAmount)}</span></p>
            <button className="btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto">
              <CreditCard className="w-4 h-4" />
              <span>Pay & Add Credits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletTopUp


