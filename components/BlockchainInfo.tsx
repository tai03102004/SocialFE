'use client'

import { Database, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { blockchainApi } from '@/lib/api'

export default function BlockchainInfo() {
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlockchainInfo()
    const interval = setInterval(fetchBlockchainInfo, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchBlockchainInfo = async () => {
    try {
      const response = await blockchainApi.getInfo()
      if (response.success) {
        setBlockchainData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch blockchain info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  const explorerUrl = 'https://somnia-devnet.socialscan.io/address'

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            Blockchain Info
          </h3>
          <p className="text-sm text-slate-400 mt-1">Somnia Network</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-slate-300 mb-1">Network</p>
          <p className="font-bold text-lg">{blockchainData?.network || 'Somnia Testnet'}</p>
          <p className="text-sm text-slate-400">Chain ID: {blockchainData?.chainId || '50312'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <p className="text-xs text-slate-400 mb-1">Wallet</p>
            <p className="font-mono text-xs truncate">
              {blockchainData?.walletAddress ? 
                `${blockchainData.walletAddress.slice(0, 6)}...${blockchainData.walletAddress.slice(-4)}` 
                : 'Not connected'}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <p className={`font-bold text-sm ${blockchainData?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {blockchainData?.isConnected ? '● Connected' : '● Disconnected'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400">Smart Contracts</p>
          
          {blockchainData?.contracts?.signalStorage && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">SignalStorage</p>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    {blockchainData.contracts.signalStorage}
                  </p>
                </div>
                <a 
                  href={`${explorerUrl}/${blockchainData.contracts.signalStorage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-2 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </a>
              </div>
            </div>
          )}

          {blockchainData?.contracts?.tradeExecutor && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">TradeExecutor</p>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    {blockchainData.contracts.tradeExecutor}
                  </p>
                </div>
                <a 
                  href={`${explorerUrl}/${blockchainData.contracts.tradeExecutor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-2 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </a>
              </div>
            </div>
          )}
        </div>

        {blockchainData?.hasSignalStorage && blockchainData?.hasTradeExecutor && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-sm text-green-400 font-medium">
              ✓ All contracts deployed and connected
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
