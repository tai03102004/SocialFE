'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Award, Target, Shield, RefreshCw, Brain } from 'lucide-react'
import { tradingApi } from '@/lib/api'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)


  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    // try {
      const response = await tradingApi.getStats();
      if (response.success) {
        setStats(response.stats)
      }
    // } catch (error) {
    //   console.error('Failed to fetch stats:', error)
    // } finally {
    //   setLoading(false)
    //   setRefreshing(false)
    // }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 mb-1">Trading Statistics</h1>
            <p className="text-slate-400">Comprehensive performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-center py-8 text-slate-400">Loading statistics...</div>
        </div>
      ) : (
        <>
          {/* Overview Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Overview
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

            {/* Risk Limits */}
            {stats?.risk?.riskLimits && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-3">Risk Limits Configuration</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-sm">
                    <p className="text-slate-500">Max Position Size</p>
                    <p className="text-white font-medium">
                      {(stats.risk.riskLimits.maxPositionSize * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Max Daily Loss</p>
                    <p className="text-white font-medium">
                      {(stats.risk.riskLimits.maxDailyLoss * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Min Confidence</p>
                    <p className="text-white font-medium">
                      {(stats.risk.riskLimits.minConfidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Max Open Positions</p>
                    <p className="text-white font-medium">
                      {stats.risk.riskLimits.maxOpenPositions}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}