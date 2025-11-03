'use client'

import { useState, useEffect } from 'react'
import { Database, Play, ExternalLink, CheckCircle, XCircle, RefreshCw, TrendingUp, Activity } from 'lucide-react'
import { blockchainApi } from '@/lib/api'

export default function BlockchainPage() {
  const [status, setStatus] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'signals' | 'trades'>('status')

  // Form states
  const [signalId, setSignalId] = useState('')
  const [tradeId, setTradeId] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, analyticsRes, signalsRes, tradesRes] = await Promise.all([
        blockchainApi.getStatus(),
        blockchainApi.getAnalytics(),
        blockchainApi.getSignals(20),
        blockchainApi.getTrades()
      ])

      setStatus(statusRes)
      setAnalytics(analyticsRes)
      if (signalsRes.success) setSignals(signalsRes.data || [])
      if (tradesRes.success) setTrades(tradesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTestSignal = async () => {
    setExecuting(true)
    try {
      const result = await blockchainApi.submitSignal({
        coin: 'bitcoin',
        action: 'BUY',
        confidence: 0.85,
        entryPoint: 50000,
        stopLoss: 48000,
        takeProfit: 55000,
        reasoning: 'Test signal from UI'
      })
      setQueryResult(result)
      await fetchData() // Refresh data
    } finally {
      setExecuting(false)
    }
  }

  const handleExecuteTestTrade = async () => {
    setExecuting(true)
    try {
      const result = await blockchainApi.executeTrade({
        symbol: 'BTCUSDT',
        side: 'BUY',
        amount: 0.001,
        price: 50000
      })
      setQueryResult(result)
      await fetchData()
    } finally {
      setExecuting(false)
    }
  }

  const handleGetSignal = async () => {
    if (!signalId) return
    try {
      const result = await blockchainApi.getSignalById(signalId)
      setQueryResult(result)
    } catch (error: any) {
      setQueryResult({ success: false, error: error.message })
    }
  }

  const handleGetTrade = async () => {
    if (!tradeId) return
    try {
      const result = await blockchainApi.getTradeById(tradeId)
      setQueryResult(result)
    } catch (error: any) {
      setQueryResult({ success: false, error: error.message })
    }
  }

  const handleRetryCache = async () => {
    setExecuting(true)
    try {
      const result = await blockchainApi.retryCache()
      setQueryResult(result)
      await fetchData()
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-slate-400">Loading blockchain data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="web3-card p-6 glow-purple">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1">Blockchain Integration</h1>
            <p className="text-slate-400">Somnia Network • Real-time on-chain data</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Database className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            {status?.isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className="font-bold">{status?.isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>
        </div>

        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Total Signals</p>
              <p className="font-bold">{analytics?.global?.totalSignals || 0}</p>
            </div>
          </div>
        </div>

        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Total Trades</p>
              <p className="font-bold">{analytics?.global?.totalTrades || 0}</p>
            </div>
          </div>
        </div>

        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">Cache Size</p>
              <p className="font-bold">{(status?.cache?.signals || 0) + (status?.cache?.trades || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {(['status', 'signals', 'trades'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* Connection Info */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Connection Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Network</p>
                <p className="font-mono text-sm">{status?.network || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Mode</p>
                <p className="font-mono text-sm">{status?.mode || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Wallet</p>
                <p className="font-mono text-xs truncate">{status?.wallet || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Enabled</p>
                <p className={status?.isEnabled ? 'text-green-400' : 'text-red-400'}>
                  {status?.isEnabled ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Smart Contracts */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Smart Contracts</h3>
            <div className="space-y-3">
              {Object.entries(status?.contracts || {}).map(([name, address]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-dark-lighter rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-xs font-mono text-slate-400 truncate">{address as string}</p>
                  </div>
                  {address !== 'N/A' && (
                    <a
                      href={`https://somnia-devnet.socialscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-2 hover:bg-slate-600 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Blockchain Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(status?.metrics || {}).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-dark-lighter rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{value as number}</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace('total', '').trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="web3-card p-6">
              <h3 className="text-lg font-bold mb-4">Submit Test Signal</h3>
              <button
                onClick={handleSubmitTestSignal}
                disabled={executing}
                className="web3-button w-full disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                {executing ? 'Submitting...' : 'Submit Test Signal'}
              </button>
            </div>

            <div className="web3-card p-6">
              <h3 className="text-lg font-bold mb-4">Execute Test Trade</h3>
              <button
                onClick={handleExecuteTestTrade}
                disabled={executing}
                className="web3-button w-full disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                {executing ? 'Executing...' : 'Execute Test Trade'}
              </button>
            </div>
          </div>

          {/* Cache Retry */}
          {status?.cache && (status.cache.signals > 0 || status.cache.trades > 0) && (
            <div className="web3-card p-6">
              <h3 className="text-lg font-bold mb-4">Retry Cached Submissions</h3>
              <p className="text-sm text-slate-400 mb-4">
                {status.cache.signals} signals and {status.cache.trades} trades pending
              </p>
              <button
                onClick={handleRetryCache}
                disabled={executing}
                className="web3-button w-full disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {executing ? 'Retrying...' : 'Retry All'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Signals Tab */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          {/* Query Signal */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Query Signal by ID</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={signalId}
                onChange={(e) => setSignalId(e.target.value)}
                placeholder="Enter signal ID"
                className="flex-1 bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
              />
              <button
                onClick={handleGetSignal}
                disabled={!signalId}
                className="web3-button disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Get
              </button>
            </div>
          </div>

          {/* Latest Signals */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Latest Signals ({signals.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {signals.map((signal, idx) => (
                <div key={idx} className="p-4 bg-dark-lighter rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">Signal #{signal.id || idx + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                      signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {signal.action}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Coin:</span>
                      <span className="ml-2 font-medium">{signal.symbol || signal.coin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Confidence:</span>
                      <span className="ml-2 font-medium">{signal.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Entry:</span>
                      <span className="ml-2 font-medium">${signal.entryPoint}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className="ml-2 font-medium">{signal.executed ? 'Executed' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {signals.length === 0 && (
                <p className="text-center text-slate-400 py-8">No signals found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && (
        <div className="space-y-4">
          {/* Query Trade */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Query Trade by ID</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={tradeId}
                onChange={(e) => setTradeId(e.target.value)}
                placeholder="Enter trade ID"
                className="flex-1 bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
              />
              <button
                onClick={handleGetTrade}
                disabled={!tradeId}
                className="web3-button disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Get
              </button>
            </div>
          </div>

          {/* Latest Trades */}
          <div className="web3-card p-6">
            <h3 className="text-lg font-bold mb-4">Latest Trades ({trades.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trades.map((trade, idx) => (
                <div key={idx} className="p-4 bg-dark-lighter rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">Trade #{trade.id || idx + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.side === 'BUY' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Symbol:</span>
                      <span className="ml-2 font-medium">{trade.symbol}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount:</span>
                      <span className="ml-2 font-medium">{trade.amount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Price:</span>
                      <span className="ml-2 font-medium">${trade.price}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className="ml-2 font-medium">{trade.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-center text-slate-400 py-8">No trades found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Result */}
      {queryResult && (
        <div className="web3-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Query Result</h3>
            <button
              onClick={() => setQueryResult(null)}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <pre className="text-xs overflow-x-auto bg-dark-lighter p-4 rounded-lg">
            {JSON.stringify(queryResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}