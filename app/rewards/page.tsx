'use client'

import { useState, useEffect } from 'react'
import { Gift, Play, Users, Wallet, RefreshCw, DollarSign } from 'lucide-react'
import { rewardsApi } from '@/lib/api'

export default function RewardsPage() {
  // Single distribution
  const [userAddress, setUserAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Balance check
  const [checkAddress, setCheckAddress] = useState('')
  const [balance, setBalance] = useState<any>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Bulk distribution
  const [bulkRecipients, setBulkRecipients] = useState('')
  const [bulkResult, setBulkResult] = useState<any>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalDistributed: 0,
    recipientsCount: 0,
    avgReward: 0
  })

  useEffect(() => {
    loadMyBalance()
  }, [])

  const loadMyBalance = async () => {
    try {
      const res = await rewardsApi.getBalance()
      if (res.success) {
        setBalance(res)
      }
    } catch (error) {
      console.error('Failed to load balance:', error)
    }
  }

  const handleDistribute = async () => {
    if (!userAddress || !amount) return
    
    setLoading(true)
    try {
      const res = await rewardsApi.distribute(
        userAddress, 
        parseFloat(amount),
        reason || 'Trading performance'
      )
      setResult(res)
      
      if (res.success) {
        setUserAddress('')
        setAmount('')
        setReason('')
        loadMyBalance()
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckBalance = async () => {
    if (!checkAddress) return
    
    setBalanceLoading(true)
    try {
      const res = await rewardsApi.getBalance(checkAddress)
      setBalance(res)
    } catch (error: any) {
      setBalance({ success: false, error: error.message })
    } finally {
      setBalanceLoading(false)
    }
  }

  const handleBulkDistribute = async () => {
    if (!bulkRecipients.trim()) return
    
    setBulkLoading(true)
    try {
      // Parse CSV format: address,amount,reason
      const lines = bulkRecipients.trim().split('\n')
      const recipients = lines.map(line => {
        const [address, amount, reason] = line.split(',').map(s => s.trim())
        return {
          address,
          amount: parseFloat(amount),
          reason: reason || 'Bulk reward distribution'
        }
      })

      const res = await rewardsApi.bulkDistribute(recipients)
      setBulkResult(res)
      
      if (res.success) {
        setBulkRecipients('')
        loadMyBalance()
        
        // Update stats
        setStats({
          totalDistributed: res.totalDistributed || 0,
          recipientsCount: res.successful || 0,
          avgReward: res.totalDistributed / (res.successful || 1)
        })
      }
    } catch (error: any) {
      setBulkResult({ success: false, error: error.message })
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="web3-card p-6 glow-cyan">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1">Reward Distribution</h1>
            <p className="text-slate-400">Distribute ASRT tokens to contributors</p>
          </div>
          <Gift className="w-8 h-8 text-cyan-400" />
        </div>

        {balance && balance.success && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-lighter rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-400">Treasury Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {parseFloat(balance.balance).toFixed(2)} ASRT
              </p>
            </div>
            <div className="p-4 bg-dark-lighter rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-400">Total Distributed</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalDistributed.toFixed(2)} ASRT
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Distribution */}
        <div className="web3-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Single Distribution</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Wallet Address</label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
              />
            </div>
            
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Amount (ASRT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                step="0.01"
                className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Reason (Optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Trading performance"
                className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
              />
            </div>
            
            <button
              onClick={handleDistribute}
              disabled={loading || !userAddress || !amount}
              className="web3-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Distributing...' : 'Distribute Rewards'}
            </button>
          </div>
          
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm font-medium ${result.success ? 'text-green-400' : 'text-red-400'} mb-2`}>
                {result.success ? '✅ Success' : '❌ Failed'}
              </p>
              <pre className="text-xs overflow-x-auto text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Balance Check */}
        <div className="web3-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Check Balance</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Wallet Address</label>
              <input
                type="text"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                placeholder="0x... (leave empty for your wallet)"
                className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500"
              />
            </div>
            
            <button
              onClick={handleCheckBalance}
              disabled={balanceLoading}
              className="web3-button w-full disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${balanceLoading ? 'animate-spin' : ''}`} />
              {balanceLoading ? 'Checking...' : 'Check Balance'}
            </button>
          </div>
          
          {balance && (
            <div className={`mt-4 p-4 rounded-lg ${balance.success ? 'bg-dark-lighter border border-primary/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {balance.success ? (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {parseFloat(balance.balance).toFixed(2)} <span className="text-lg text-cyan-400">ASRT</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2 break-all">
                    {balance.address}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-400">{balance.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Distribution */}
      <div className="web3-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold">Bulk Distribution</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Recipients (CSV format: address,amount,reason)
            </label>
            <textarea
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              placeholder="0x123...,100,Good trader&#10;0x456...,50,Active voter&#10;0x789...,75,Signal contributor"
              rows={6}
              className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: 0x123...,100,Good performance
            </p>
          </div>

          <button
            onClick={handleBulkDistribute}
            disabled={bulkLoading || !bulkRecipients.trim()}
            className="web3-button w-full disabled:opacity-50 flex items-center justify-center"
          >
            <Users className="w-4 h-4 mr-2" />
            {bulkLoading ? 'Distributing...' : 'Bulk Distribute'}
          </button>
        </div>

        {bulkResult && (
          <div className={`mt-4 p-4 rounded-lg ${bulkResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className={`text-sm font-medium ${bulkResult.success ? 'text-green-400' : 'text-red-400'} mb-2`}>
              {bulkResult.success ? '✅ Bulk Distribution Complete' : '❌ Failed'}
            </p>
            
            {bulkResult.success && (
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-lg font-bold text-white">{bulkResult.totalDistributed} ASRT</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Successful</p>
                  <p className="text-lg font-bold text-green-400">{bulkResult.successful}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Failed</p>
                  <p className="text-lg font-bold text-red-400">{bulkResult.failed}</p>
                </div>
              </div>
            )}
            
            <pre className="text-xs overflow-x-auto text-slate-300 max-h-64 overflow-y-auto">
              {JSON.stringify(bulkResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}