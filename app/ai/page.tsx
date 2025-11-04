'use client'

import { useEffect, useState } from 'react'
import { Activity, RefreshCw, Brain, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { analysisApi } from '@/lib/api'
import ReactMarkdown from 'react-markdown'

export default function AgentsPage() {
  const [aiAnalysis, setAiAnalysis] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const coins = ['bitcoin', 'ethereum']
      const [aiResponses] = await Promise.all([
        Promise.all(coins.map(symbol => analysisApi.trigger(symbol)))
      ])
      const aiData: { [key: string]: any } = {}
      coins.forEach((coin, i) => {
        aiData[coin] = aiResponses[i]
      })
      setAiAnalysis(aiData)
    } catch (error) {
      console.error('⚠️ Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchStats()
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 md:p-10 text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-indigo-300">AI Market Analysis</h1>
            <p className="text-gray-400 text-sm">Automated insights powered by Somnia AI</p>
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Coin Analysis Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        {Object.entries(aiAnalysis).map(([coin, data], index) => (
          <motion.div
            key={coin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="h-full p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-[#111827] to-[#1f2937] shadow-md hover:shadow-lg hover:border-indigo-600/40 transition-all duration-200">
              {/* Header of each coin */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold capitalize flex items-center gap-2 text-indigo-300">
                  <Activity className="text-indigo-500 h-5 w-5" />
                  {coin}
                </h2>
                {data?.sentiment === 'bullish' ? (
                  <TrendingUp className="text-emerald-400" />
                ) : data?.sentiment === 'bearish' ? (
                  <TrendingDown className="text-rose-400" />
                ) : (
                  <Activity className="text-gray-500" />
                )}
              </div>

              {/* Markdown nội dung */}
              <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-strong:text-gray-100 prose-li:marker:text-indigo-400 prose-p:text-gray-200 prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded leading-relaxed">
                <ReactMarkdown>
                  {data?.analysis || 'No analysis available yet.'}
                </ReactMarkdown>
              </div>

              {/* Confidence line */}
              {data?.confidence && (
                <div className="mt-5 text-sm border-t border-gray-700 pt-3 text-gray-400">
                  Confidence:{' '}
                  <span className="font-medium text-indigo-400">
                    {data.confidence}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {!Object.keys(aiAnalysis).length && !loading && (
        <div className="text-center text-gray-500 mt-10">
          No analysis yet. Click{' '}
          <span className="font-semibold text-indigo-400">Refresh</span> to start.
        </div>
      )}
    </div>
  )
}
