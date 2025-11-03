'use client'

import { useState, useEffect } from 'react'
import { Vote, Play, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react'
import { daoApi, blockchainApi } from '@/lib/api'

export default function DAOPage() {
  const [votingPower, setVotingPower] = useState<number>(0)
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)

  // Create proposal form
  const [signalId, setSignalId] = useState('')
  const [description, setDescription] = useState('')
  const [createResult, setCreateResult] = useState<any>(null)

  // Vote form
  const [proposalId, setProposalId] = useState('')
  const [proposalDetails, setProposalDetails] = useState<any>(null)
  const [voteResult, setVoteResult] = useState<any>(null)

  // Query form
  const [queryProposalId, setQueryProposalId] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [powerRes, signalsRes] = await Promise.all([
        daoApi.getVotingPower(),
        blockchainApi.getSignals(50)
      ])

      if (powerRes.success) setVotingPower(powerRes.votingPower)
      if (signalsRes.success) {
        // Filter signals with confidence 60-75%
        const borderlineSignals = (signalsRes.data || []).filter((s: any) => 
          s.confidence >= 60 && s.confidence < 75
        )
        setSignals(borderlineSignals)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProposal = async () => {
    if (!signalId || !description) return
    
    setExecuting(true)
    try {
      const result = await daoApi.createProposal(signalId, description)
      setCreateResult(result)
      
      if (result.success) {
        setSignalId('')
        setDescription('')
      }
    } finally {
      setExecuting(false)
    }
  }

  const handleGetProposal = async () => {
    if (!queryProposalId) return
    
    try {
      const result = await daoApi.getProposal(queryProposalId)
      setQueryResult(result)
      
      if (result.success) {
        setProposalDetails(result.data)
        setProposalId(queryProposalId)
      }
    } catch (error: any) {
      setQueryResult({ success: false, error: error.message })
    }
  }

  const handleVote = async (support: boolean) => {
    if (!proposalId) return
    
    setExecuting(true)
    try {
      const result = await daoApi.vote(proposalId, support)
      setVoteResult(result)
      
      if (result.success) {
        // Refresh proposal details
        await handleGetProposal()
      }
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="web3-card p-6 glow-pink">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1">DAO Governance</h1>
            <p className="text-slate-400">Community voting on trading signals</p>
          </div>
          <Vote className="w-8 h-8 text-pink-400" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-pink-400" />
            <div>
              <p className="text-sm text-slate-400">Your Voting Power</p>
              <p className="text-2xl font-bold">{votingPower}</p>
            </div>
          </div>
        </div>

        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Eligible Signals</p>
              <p className="text-2xl font-bold">{signals.length}</p>
            </div>
          </div>
        </div>

        <div className="web3-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Voting Period</p>
              <p className="text-2xl font-bold">3 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Proposal */}
      <div className="web3-card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-pink-400" />
          Create Proposal
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Create a DAO proposal for signals with confidence between 60-75%
        </p>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Signal ID</label>
            <input
              type="text"
              value={signalId}
              onChange={(e) => setSignalId(e.target.value)}
              placeholder="Enter signal ID (e.g., 25)"
              className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe why this signal should be executed..."
              rows={4}
              className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
            />
          </div>

          <button
            onClick={handleCreateProposal}
            disabled={executing || !signalId || !description}
            className="web3-button w-full disabled:opacity-50 flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            {executing ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
        
        {createResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            createResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(createResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Query Proposal */}
      <div className="web3-card p-6">
        <h3 className="text-lg font-bold mb-4">Query Proposal</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={queryProposalId}
            onChange={(e) => setQueryProposalId(e.target.value)}
            placeholder="Enter proposal ID"
            className="flex-1 bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
          />
          <button
            onClick={handleGetProposal}
            disabled={!queryProposalId}
            className="web3-button disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" />
            Get
          </button>
        </div>

        {proposalDetails && (
          <div className="mt-4 p-4 bg-dark-lighter rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Proposal #{proposalDetails.id}</h4>
              {proposalDetails.executed && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  Executed
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Signal ID</p>
                <p className="font-medium">#{proposalDetails.signalId}</p>
              </div>
              <div>
                <p className="text-slate-400">Start Time</p>
                <p className="font-medium">{new Date(proposalDetails.startTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">End Time</p>
                <p className="font-medium">{new Date(proposalDetails.endTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <p className="font-medium">{proposalDetails.executed ? 'Closed' : 'Active'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Description</p>
              <p className="text-sm">{proposalDetails.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-slate-400">Votes For</p>
                <p className="text-2xl font-bold text-green-400">{proposalDetails.votesFor}</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-slate-400">Votes Against</p>
                <p className="text-2xl font-bold text-red-400">{proposalDetails.votesAgainst}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vote on Proposal */}
      <div className="web3-card p-6">
        <h3 className="text-lg font-bold mb-4">Cast Your Vote</h3>
        <p className="text-sm text-slate-400 mb-4">
          Your voting power: <span className="font-bold text-white">{votingPower}</span>
        </p>
        
        <div className="space-y-3">
          <input
            type="text"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            placeholder="Proposal ID (auto-filled from query above)"
            className="w-full bg-dark-lighter border border-primary/20 rounded-xl px-4 py-3"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={executing || !proposalId || votingPower === 0}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:opacity-50 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Vote For
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={executing || !proposalId || votingPower === 0}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:opacity-50 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Vote Against
            </button>
          </div>

          {votingPower === 0 && (
            <p className="text-sm text-yellow-400 text-center">
              ⚠️ You need reward tokens to vote
            </p>
          )}
        </div>
        
        {voteResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            voteResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(voteResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Eligible Signals */}
      <div className="web3-card p-6">
        <h3 className="text-lg font-bold mb-4">
          Signals Eligible for DAO Voting ({signals.length})
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Signals with confidence between 60-75% can be voted on by the community
        </p>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {signals.map((signal, idx) => (
            <div key={idx} className="p-4 bg-dark-lighter rounded-lg hover:bg-dark-lighter/80 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">Signal #{signal.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {signal.action}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSignalId(signal.id.toString())
                    setDescription(`Community vote for ${signal.action} ${signal.symbol} at confidence ${signal.confidence}%`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded text-xs"
                >
                  Create Proposal
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Symbol:</span>
                  <span className="ml-2 font-medium">{signal.symbol}</span>
                </div>
                <div>
                  <span className="text-slate-400">Confidence:</span>
                  <span className="ml-2 font-medium text-yellow-400">{signal.confidence}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Entry:</span>
                  <span className="ml-2 font-medium">${signal.entryPoint}</span>
                </div>
              </div>
            </div>
          ))}
          
          {signals.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              No eligible signals found. Signals with 60-75% confidence can be voted on.
            </p>
          )}
        </div>
      </div>

      {/* Query Result */}
      {queryResult && !proposalDetails && (
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