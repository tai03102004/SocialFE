'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, DollarSign, AlertTriangle, Activity } from 'lucide-react'
import { tradingApi } from '@/lib/api'

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 15000) // Update every 15s
    return () => clearInterval(interval)
  }, [])

  const fetchPortfolio = async () => {
    try {
      const response = await tradingApi.getPortfolio()
      if (response.success) {
        setPortfolio(response.portfolio)
      }
    } catch (error) {
      console.error('Portfolio fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 mb-1">Portfolio</h1>
            <p className="text-slate-400">Your trading positions and performance</p>
          </div>
          <Wallet className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-center py-8 text-slate-400">Loading portfolio...</div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <p className="text-sm text-slate-400">Open Positions</p>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {portfolio?.openPositions || 0}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-sm text-slate-400">Total P&L</p>
              </div>
              <p className={`text-3xl font-bold ${
                (portfolio?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(portfolio?.totalPnL || 0) >= 0 ? '+' : ''}
                ${(portfolio?.totalPnL || 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Realized: ${(portfolio?.totalRealizedPnL || 0).toFixed(2)} | 
                Unrealized: ${(portfolio?.totalUnrealizedPnL || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-slate-400">Win Rate</p>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {portfolio?.winRate || 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {portfolio?.winTrades || 0}W / {portfolio?.lossTrades || 0}L
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <p className="text-sm text-slate-400">Drawdown</p>
              </div>
              <p className="text-3xl font-bold text-orange-400">
                {((portfolio?.risk?.drawdown || 0) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Peak: ${(portfolio?.risk?.peakEquity || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">Avg Win</p>
                <p className="text-lg font-bold text-green-400">
                  ${(portfolio?.avgWin || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Loss</p>
                <p className="text-lg font-bold text-red-400">
                  ${(portfolio?.avgLoss || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Profit Factor</p>
                <p className="text-lg font-bold text-purple-400">
                  {(portfolio?.profitFactor || 0).toFixed(2)}x
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Trades</p>
                <p className="text-lg font-bold text-blue-400">
                  {portfolio?.totalTrades || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Active Positions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Active Positions</h3>
            
            {!portfolio?.positions || portfolio.positions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No active positions</p>
            ) : (
              <div className="space-y-3">
                {portfolio.positions.map((position: any, index: number) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg">{position.symbol}</p>
                        <p className="text-sm text-slate-400">
                          {position.side} • {position.quantity.toFixed(6)} @ ${position.entryPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Duration: {formatDuration(position.durationMinutes)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${(position.quantity * position.currentPrice).toFixed(2)}
                        </p>
                        {position.unrealizedPnL && (
                          <p className={`text-sm font-medium ${
                            position.unrealizedPnL.absolute >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {position.unrealizedPnL.absolute >= 0 ? '+' : ''}
                            ${position.unrealizedPnL.absolute.toFixed(2)} 
                            ({position.unrealizedPnL.percentage.toFixed(2)}%)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stop Loss & Take Profit */}
                    <div className="flex gap-4 text-xs">
                      <div className="flex-1 bg-red-500/10 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-medium">Stop Loss</p>
                        <p className="text-white font-mono">${position.stopLoss.toFixed(2)}</p>
                      </div>
                      <div className="flex-1 bg-green-500/10 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-medium">Take Profit</p>
                        <p className="text-white font-mono">${position.takeProfit.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* LSTM Prediction */}
                    {position.lstmPrediction && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-xs text-slate-400 mb-1">LSTM Prediction:</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            position.lstmPrediction.trend === 'BULLISH' 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {position.lstmPrediction.trend}
                          </span>
                          <span className="text-slate-400">
                            Target: ${position.lstmPrediction.nextPrice.toFixed(2)}
                          </span>
                          <span className="text-slate-500">
                            ({(position.lstmPrediction.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}