'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Award, Target, Shield, RefreshCw, Brain, Play, Pause, Settings, Wallet, DollarSign } from 'lucide-react'
import { tradingApi } from '@/lib/api'

export default function TradingPage() {
  const [stats, setStats] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null) 
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoTrading, setAutoTrading] = useState(false)
  const [tradingMode, setTradingMode] = useState('paper')
  const [portfolio, setPortfolio] = useState<any>(null) 

  useEffect(() => {
    fetchAllData()
    loadAutoTradingStatus()
    const interval = setInterval(fetchAllData, 30000) 
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      const [statsResponse, balanceResponse, portfolioResponse] = await Promise.all([
        tradingApi.getStats().catch(err => ({ success: false, error: err.message })),
        tradingApi.getBalance().catch(err => ({ success: false, error: err.message })),
        tradingApi.getPortfolio().catch(err => ({ success: false, error: err.message }))
      ])

      console.log('📊 Stats Response:', statsResponse)
      console.log('💰 Balance Response:', balanceResponse)
      console.log('💼 Portfolio Response:', portfolioResponse)

      if (statsResponse.success) {
        setStats(statsResponse.stats)
      } else {
        setStats({
          overview: {
            totalTrades: 0,
            openPositions: 0,
            closedPositions: 0,
            totalPnL: 0,
            dailyPnL: 0
          },
          performance: {
            winRate: 0,
            winningTrades: 0,
            losingTrades: 0,
            avgWin: 0,
            avgLoss: 0,
            bestTrade: 0,
            worstTrade: 0
          },
          risk: {
            currentEquity: 0,
            peakEquity: 0,
            drawdown: 0,
            riskLimits: {}
          }
        })
      }

      if (balanceResponse.success) {
        setBalance(balanceResponse.balance)
      }

      if (portfolioResponse.success) {
        setPortfolio(portfolioResponse.portfolio)
      }

    } catch (error) {
      console.error('Failed to fetch trading data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadAutoTradingStatus = async () => {
    try {
      const response = await tradingApi.getAutoTradingStatus()
      if (response.success) {
        setAutoTrading(response.autoTrading)
        setTradingMode(response.mode)
      }
    } catch (error) {
      console.error('Failed to load auto trading status:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
  }

  const toggleAutoTrading = async () => {
    try {
      setRefreshing(true)
      const response = await tradingApi.setAutoTrading(!autoTrading, tradingMode as "paper" | "live")
      if (response.success) {
        setAutoTrading(!autoTrading)
        console.log(`Auto trading ${!autoTrading ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      console.error('Failed to toggle auto trading:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const switchTradingMode = async (mode: 'paper' | 'live') => {
    try {
      setRefreshing(true)
      const response = await tradingApi.setTradingMode(mode)
      if (response.success) {
        setTradingMode(mode)
        await fetchAllData()
      }
    } catch (error) {
      console.error('Failed to switch trading mode:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Auto Trading Controls */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 mb-1">Trading Dashboard</h1>
            <p className="text-slate-400">AI-powered automated trading system</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Trading Mode Switch */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => switchTradingMode('paper')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  tradingMode === 'paper' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paper
              </button>
              <button
                onClick={() => switchTradingMode('live')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  tradingMode === 'live' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live
              </button>
            </div>

            {/* Auto Trading Toggle */}
            <button
              onClick={toggleAutoTrading}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                autoTrading 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50`}
            >
              {autoTrading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoTrading ? 'Stop Trading' : 'Start Trading'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoTrading ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-slate-300">
              Auto Trading: {autoTrading ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${tradingMode === 'live' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
            <span className="text-slate-300">
              Mode: {tradingMode === 'live' ? 'Live Trading' : 'Paper Trading'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-slate-300">
              USDT Balance: ${typeof balance?.USDT === 'number' ? balance.USDT.toFixed(2) : (balance?.USDT?.free?.toFixed(2) || '0.00')}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Wallet Balance Section - Fixed for new API format */}
      {balance && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            Wallet Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* USDT Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">USDT</span>
                <DollarSign className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Available:</span>
                  <span className="text-sm font-medium text-green-400">
                    {typeof balance.USDT === 'number' ? balance.USDT.toFixed(2) : (balance.USDT?.free || '0.00')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">In Orders:</span>
                  <span className="text-sm font-medium text-orange-400">
                    {typeof balance.USDT === 'number' ? '0.00' : (balance.USDT?.locked || '0.00')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1">
                  <span className="text-xs text-slate-400">Total:</span>
                  <span className="text-sm font-bold text-white">
                    {typeof balance.USDT === 'number' ? balance.USDT.toFixed(2) : 
                     ((parseFloat(balance.USDT?.free || 0) + parseFloat(balance.USDT?.locked || 0)).toFixed(2))}
                  </span>
                </div>
              </div>
            </div>

            {/* BTC Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">BTC</span>
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Available:</span>
                  <span className="text-sm font-medium text-green-400">
                    {typeof balance.BTC === 'number' ? balance.BTC.toFixed(6) : (balance.BTC?.free || '0.000000')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">In Orders:</span>
                  <span className="text-sm font-medium text-orange-400">
                    {typeof balance.BTC === 'number' ? '0.000000' : (balance.BTC?.locked || '0.000000')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1">
                  <span className="text-xs text-slate-400">Total:</span>
                  <span className="text-sm font-bold text-white">
                    {typeof balance.BTC === 'number' ? balance.BTC.toFixed(6) : 
                     ((parseFloat(balance.BTC?.free || 0) + parseFloat(balance.BTC?.locked || 0)).toFixed(6))}
                  </span>
                </div>
              </div>
            </div>

            {/* ETH Card */}
            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">ETH</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Available:</span>
                  <span className="text-sm font-medium text-green-400">
                    {typeof balance.ETH === 'number' ? balance.ETH.toFixed(6) : (balance.ETH?.free || '0.000000')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">In Orders:</span>
                  <span className="text-sm font-medium text-orange-400">
                    {typeof balance.ETH === 'number' ? '0.000000' : (balance.ETH?.locked || '0.000000')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1">
                  <span className="text-xs text-slate-400">Total:</span>
                  <span className="text-sm font-bold text-white">
                    {typeof balance.ETH === 'number' ? balance.ETH.toFixed(6) : 
                     ((parseFloat(balance.ETH?.free || 0) + parseFloat(balance.ETH?.locked || 0)).toFixed(6))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trading Mode Notice */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> {tradingMode === 'live' ? 
                '🔴 You are using LIVE trading mode with real Binance funds!' : 
                '🔵 You are in PAPER trading mode - balances shown are demo data.'
              }
            </p>
          </div>

          {/* Total Portfolio Value */}
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-green-400">Total Portfolio Value</span>
              <span className="text-2xl font-bold text-green-400">
                ${typeof balance.total === 'number' ? balance.total.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-center py-8 text-slate-400">Loading trading statistics...</div>
        </div>
      ) : (
        <>
          {/* Overview Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Trading Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats?.overview?.totalTrades || 0}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Open Positions</p>
                <p className="text-2xl font-bold text-orange-400">
                  {stats?.overview?.openPositions || 0}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Closed Positions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats?.overview?.closedPositions || 0}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  (stats?.overview?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(stats?.overview?.totalPnL || 0) >= 0 ? '+' : ''}
                  ${(stats?.overview?.totalPnL || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Daily P&L</p>
                <p className={`text-2xl font-bold ${
                  (stats?.overview?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(stats?.overview?.dailyPnL || 0) >= 0 ? '+' : ''}
                  ${(stats?.overview?.dailyPnL || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Current Positions from Portfolio */}
          {portfolio?.positions && portfolio.positions.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-400" />
                Active Positions
              </h3>
              <div className="space-y-3">
                {portfolio.positions.map((position: any, index: number) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">{position.symbol}</h4>
                        <p className="text-sm text-slate-400">
                          {position.side} • Qty: {position.quantity?.toFixed(6)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${position.entryPrice?.toFixed(2)}</p>
                        <p className={`text-sm ${
                          position.unrealizedPnL?.absolute >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          PnL: ${position.unrealizedPnL?.absolute?.toFixed(2) || '0.00'} 
                          ({position.unrealizedPnL?.percentage?.toFixed(2) || '0.00'}%)
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
                      <div>SL: ${position.stopLoss?.toFixed(2) || 'N/A'}</div>
                      <div>TP: ${position.takeProfit?.toFixed(2) || 'N/A'}</div>
                      <div>Duration: {position.durationMinutes || 0}m</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto Trading Settings */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Auto Trading Configuration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Min Confidence</p>
                <p className="text-xl font-bold text-purple-400">75%</p>
                <p className="text-xs text-slate-500 mt-1">Signal threshold</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Max Positions</p>
                <p className="text-xl font-bold text-orange-400">3</p>
                <p className="text-xs text-slate-500 mt-1">Concurrent trades</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Position Size</p>
                <p className="text-xl font-bold text-blue-400">1%</p>
                <p className="text-xs text-slate-500 mt-1">Per trade</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Stop Loss</p>
                <p className="text-xl font-bold text-red-400">3%</p>
                <p className="text-xs text-slate-500 mt-1">Max loss per trade</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Win Rate */}
              <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-slate-400 mb-2">Win Rate</p>
                <p className="text-3xl font-bold text-purple-400 mb-1">
                  {stats?.performance?.winRate || 0}%
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    {stats?.performance?.winningTrades || 0} wins
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    {stats?.performance?.losingTrades || 0} losses
                  </span>
                </div>
              </div>

              {/* Average Win */}
              <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-slate-400 mb-2">Avg Win</p>
                <p className="text-3xl font-bold text-green-400">
                  ${(stats?.performance?.avgWin || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Per winning trade</p>
              </div>

              {/* Average Loss */}
              <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-sm text-slate-400 mb-2">Avg Loss</p>
                <p className="text-3xl font-bold text-red-400">
                  ${(stats?.performance?.avgLoss || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Per losing trade</p>
              </div>

              {/* Profit Factor */}
              <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-slate-400 mb-2">Profit Factor</p>
                <p className="text-3xl font-bold text-blue-400">
                  {((stats?.performance?.avgWin || 0) / (stats?.performance?.avgLoss || 1)).toFixed(2)}x
                </p>
                <p className="text-xs text-slate-500 mt-1">Win/Loss ratio</p>
              </div>
            </div>

            {/* Best & Worst Trades */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <p className="text-sm text-green-400 mb-1 font-medium">🏆 Best Trade</p>
                <p className="text-2xl font-bold text-green-400">
                  +${(stats?.performance?.bestTrade || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                <p className="text-sm text-red-400 mb-1 font-medium">📉 Worst Trade</p>
                <p className="text-2xl font-bold text-red-400">
                  ${(stats?.performance?.worstTrade || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-400" />
              Risk Management
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Current Equity</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${(stats?.risk?.currentEquity || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Peak Equity</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(stats?.risk?.peakEquity || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Drawdown</p>
                <p className={`text-2xl font-bold ${
                  (stats?.risk?.drawdown || 0) > 0.1 ? 'text-red-400' : 'text-orange-400'
                }`}>
                  {((stats?.risk?.drawdown || 0) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Max Drawdown Limit</p>
                <p className="text-2xl font-bold text-slate-300">
                  15.00%
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}