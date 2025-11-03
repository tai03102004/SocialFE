'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { systemApi } from '@/lib/api'

export default function AgentsPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await systemApi.getStatus()
      if (response.success) {
        setSystemStatus(response.data)
      }
    } catch (error) {
      console.error('Status fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const agents = [
    { name: 'Market Agent', key: 'market', description: 'Real-time price monitoring' },
    { name: 'Analysis Agent', key: 'analysis', description: 'AI analysis & signals' },
    { name: 'Trading Agent', key: 'trading', description: 'Auto trading execution' },
    { name: 'News Agent', key: 'news', description: 'News sentiment analysis' },
    { name: 'Risk Manager', key: 'risk', description: 'Risk assessment' },
  ]

  const getStatusIcon = (status: any) => {
    const isRunning = status?.isRunning || false
    if (isRunning) return <CheckCircle className="w-5 h-5 text-green-400" />
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  const getStatusColor = (status: any) => {
    const isRunning = status?.isRunning || false
    return isRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 mb-1">AI Agents</h1>
            <p className="text-slate-400">Autonomous agents powering the trading system</p>
          </div>
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">System Status</h3>
          {systemStatus?.isRunning && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
              ● Online
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading agent status...</div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => {
              const status = systemStatus?.agents?.[agent.key]
              return (
                <div key={agent.key} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-slate-400">{agent.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status?.isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Active Signals</p>
          <p className="text-2xl font-bold text-blue-400">
            {systemStatus?.activeSignals || 0}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-purple-400">
            {systemStatus?.totalAlerts || 0}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Uptime</p>
          <p className="text-2xl font-bold text-green-400">99.9%</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Last Updated</p>
          <p className="text-sm font-mono text-slate-300">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
  )
}
