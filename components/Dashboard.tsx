'use client'

import { useState, useEffect } from 'react'
import { marketApi, systemApi, tradingApi, blockchainApi } from '@/lib/api'
import { TrendingUp, TrendingDown, Activity, Database, Wallet, BarChart3, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [marketStatus, setMarketStatus] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [tradeHistory, setTradeHistory] = useState<any[]>([])
  const [blockchainStatus, setBlockchainStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      const [market, system, port, history, blockchain] = await Promise.all([
        marketApi.getStatus().catch(() => null),
        systemApi.getStatus().catch(() => null),
        tradingApi.getPortfolio().catch(() => null),
        tradingApi.getHistory().catch(() => null),
        blockchainApi.getStatus().catch(() => null),
      ])

      if (market?.success) setMarketStatus(market)
      if (system?.success) setSystemStatus(system.data)
      if (port?.success) setPortfolio(port.portfolio)
      if (history?.success) setTradeHistory(history.history || [])
      if (blockchain?.success) setBlockchainStatus(blockchain)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-slate-400">Loading real-time data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="web3-card p-6 glow-blue">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              AI Trading Dashboard
            </h2>
            <p className="text-slate-400">Real-time data powered by Somnia blockchain</p>
          </div>
          <button
            onClick={fetchAllData}
            className="web3-button flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="web3-card p-4 glow-blue">
          <p className="text-slate-400 text-sm mb-1">Market Status</p>
          <p className="text-2xl font-bold text-green-400">● Online</p>
        </div>
        <div className="web3-card p-4 glow-purple">
          <p className="text-slate-400 text-sm mb-1">Active Signals</p>
          <p className="text-2xl font-bold text-blue-400">{marketStatus?.activeSignals || 0}</p>
        </div>
        <div className="web3-card p-4 glow-cyan">
          <p className="text-slate-400 text-sm mb-1">Open Positions</p>
          <p className="text-2xl font-bold text-purple-400">{portfolio?.openPositions || 0}</p>
        </div>
        <div className="web3-card p-4">
          <p className="text-slate-400 text-sm mb-1">Blockchain</p>
          <p className={`text-2xl font-bold ${blockchainStatus?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {blockchainStatus?.isConnected ? '✓ Connected' : '✗ Offline'}
          </p>
        </div>
      </div>

      {/* Market Data */}
      {marketStatus?.data && (
        <div className="web3-card p-6 glow-purple">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Live Market Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(marketStatus.data).map(([coin, data]: [string, any]) => (
              <div key={coin} className="bg-dark-lighter rounded-xl p-4 border border-primary/10">
                <p className="text-lg font-bold capitalize mb-3">{coin}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span className="font-bold">${data.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">24h:</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      data.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {data.change24h >= 0 ? '+' : ''}{data.change24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System & Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        {systemStatus && (
          <div className="web3-card p-6 glow-blue">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              AI Agents Status
            </h3>
            <div className="space-y-2">
              {systemStatus.agents && Object.entries(systemStatus.agents).map(([name, status]: [string, any]) => (
                <div key={name} className="flex items-center justify-between bg-dark-lighter rounded-lg p-3">
                  <span className="capitalize">{name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status.isRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {status.isRunning ? '● Running' : '● Stopped'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {portfolio && (
          <div className="web3-card p-6 glow-purple">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-purple-400" />
              Portfolio Summary
            </h3>
            <div className="space-y-3">
              <div className="bg-dark-lighter rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Total P&L</p>
                <p className={`text-3xl font-bold ${
                  (portfolio.totalRealizedPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(portfolio.totalRealizedPnL || 0) >= 0 ? '+' : ''}
                  ${(portfolio.totalRealizedPnL || 0).toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-lighter rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Positions</p>
                  <p className="text-xl font-bold text-blue-400">{portfolio.openPositions || 0}</p>
                </div>
                <div className="bg-dark-lighter rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Win Rate</p>
                  <p className="text-xl font-bold text-purple-400">{portfolio.winRate || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Trades */}
      {tradeHistory.length > 0 && (
        <div className="web3-card p-6 glow-cyan">
          <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
          <div className="space-y-2">
            {tradeHistory.slice(0, 5).map((trade: any, index: number) => (
              <div key={index} className="flex items-center justify-between bg-dark-lighter rounded-lg p-4">
                <div>
                  <p className="font-medium">{trade.symbol}</p>
                  <p className="text-xs text-slate-400">{new Date(trade.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.side}
                  </p>
                  <p className="text-xs text-slate-400">{trade.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
