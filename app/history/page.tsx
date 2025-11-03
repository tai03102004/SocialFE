'use client'

import { useState, useEffect } from 'react'
import { History, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Filter, X, Info } from 'lucide-react'
import { tradingApi } from '@/lib/api'

export default function HistoryPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchTrades = async () => {
    try {
      const params: any = { limit: 100 }
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await tradingApi.getHistory()
      if (response.success) {
        setTrades(response.history || [])
        setSummary(response.summary || null)
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTradeDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true)
      const response = await tradingApi.getTrade(orderId)
      if (response.success) {
        setSelectedTrade(response.trade)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch trade detail:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (entryTime: number, exitTime: number) => {
    if (!exitTime) return 'Open'
    const minutes = Math.floor((exitTime - entryTime) / 60000)
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
            <h1 className="text-2xl font-bold text-blue-400 mb-1">Trading History</h1>
            <p className="text-slate-400">Complete record of all trades</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Trades</option>
              <option value="open">Open Only</option>
              <option value="closed">Closed Only</option>
            </select>

            <button
              onClick={fetchTrades}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <History className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Total Trades</p>
            <p className="text-2xl font-bold text-blue-400">{summary.totalTrades}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Open Trades</p>
            <p className="text-2xl font-bold text-orange-400">{summary.openTrades}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Closed Trades</p>
            <p className="text-2xl font-bold text-purple-400">{summary.closedTrades}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Total P&L</p>
            <p className={`text-2xl font-bold ${
              summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {summary.totalPnL >= 0 ? '+' : ''}${summary.totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Avg Size</p>
            <p className="text-2xl font-bold text-slate-300">
            ${summary?.avgTradeSize?.toFixed(2) || 0}
            </p>
          </div>
        </div>
      )}

      {/* Trades Table */}
      {loading ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-center py-8 text-slate-400">Loading trades...</div>
        </div>
      ) : trades.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-center py-8 text-slate-400">No trades yet</div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Pair</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Entry</th>
                  <th className="pb-3 font-medium">Exit</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">P&L</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any, index: number) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-4 text-sm text-slate-400">
                      {formatTime(trade.timestamp)}
                    </td>
                    <td className="py-4">
                      <span className="font-medium">{trade.symbol}</span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        trade.side === 'BUY' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side === 'BUY' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-sm">
                      {trade.amount.toFixed(6)}
                    </td>
                    <td className="py-4 font-mono text-sm">
                      ${trade.price?.toFixed(2)}
                    </td>
                    <td className="py-4 font-mono text-sm">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 text-sm text-slate-400">
                      {trade.exitTime ? formatDuration(trade.timestamp, trade.exitTime) : 'Open'}
                    </td>
                    <td className="py-4">
                      {trade.pnl !== null ? (
                        <div>
                          <p className={`font-bold text-sm ${
                            trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            ({trade.pnlPercentage?.toFixed(2)}%)
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        trade.status === 'OPEN'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {/* ✅ ADD: Detail button */}
                      <button
                        onClick={() => fetchTradeDetail(trade.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ ADD: Trade Detail Modal */}
      {showDetailModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-400">Trade Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="text-sm font-mono text-white">{selectedTrade.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Symbol</p>
                    <p className="text-sm font-bold text-white">{selectedTrade.symbol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Side</p>
                    <p className={`text-sm font-bold ${
                      selectedTrade.side === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedTrade.side}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="text-sm font-bold text-white">{selectedTrade.status}</p>
                  </div>
                </div>
              </div>

              {/* Price & P&L */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 mb-3">Price & P&L</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Entry Price</p>
                    <p className="text-sm font-mono text-white">${selectedTrade.entryPoint?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Exit Price</p>
                    <p className="text-sm font-mono text-white">
                      {selectedTrade.exitPrice ? `$${selectedTrade.exitPrice.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stop Loss</p>
                    <p className="text-sm font-mono text-red-400">${selectedTrade.stopLoss?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Take Profit</p>
                    <p className="text-sm font-mono text-green-400">${selectedTrade.takeProfit?.toFixed(2)}</p>
                  </div>
                  {selectedTrade.pnl !== null && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">P&L (Absolute)</p>
                        <p className={`text-lg font-bold ${
                          selectedTrade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">P&L (Percentage)</p>
                        <p className={`text-lg font-bold ${
                          selectedTrade.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedTrade.pnlPercentage >= 0 ? '+' : ''}{selectedTrade.pnlPercentage?.toFixed(2)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* LSTM Prediction */}
              {selectedTrade.lstmPrediction && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-3">LSTM AI Prediction</h4>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Predicted Price</p>
                        <p className="text-sm font-mono text-white">
                          ${selectedTrade.lstmPrediction.nextPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Trend</p>
                        <p className={`text-sm font-bold ${
                          selectedTrade.lstmPrediction.trend === 'BULLISH'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {selectedTrade.lstmPrediction.trend}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Confidence</p>
                        <p className="text-sm font-bold text-purple-400">
                          {(selectedTrade.lstmPrediction.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Signal Info */}
              {selectedTrade.signalConfidence && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-3">Signal Information</h4>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs text-slate-500">Signal Confidence</p>
                        <p className="text-sm font-bold text-purple-400">
                          {(selectedTrade.signalConfidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      {selectedTrade.reasoning && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Reasoning</p>
                          <p className="text-xs text-slate-300">{selectedTrade.reasoning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain Info */}
              {selectedTrade.txHash && (
                <div>
                  <h4 className="text-sm font-bold text-slate-400 mb-3">Blockchain Record</h4>
                  <a
                    href={`https://somnia-devnet.socialscan.io/tx/${selectedTrade.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 hover:bg-blue-500/20"
                  >
                    <p className="text-sm font-mono text-blue-400 flex-1">
                      {selectedTrade.txHash}
                    </p>
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}