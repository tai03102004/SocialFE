'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, X, Zap, Sparkles } from 'lucide-react'
import { aiChatApi } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🌟 Hello! I\'m your **Somnia AI Trading Assistant** powered by Gemini AI. I can help you with:\n\n📈 **Market Analysis** - Technical indicators, price predictions\n💰 **Trading Strategies** - Entry/exit points, risk management\n📊 **Portfolio Advice** - Diversification, rebalancing tips\n⛓️ **Somnia Blockchain** - Learn about our technology\n🎓 **Crypto Education** - Concepts, terminology, best practices\n\nAsk me anything about cryptocurrency trading or blockchain technology!',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await aiChatApi.sendMessage(currentInput)
      
      if (response.success) {
        const aiResponse: Message = {
          role: 'assistant',
          content: response.response,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error(response.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Connection Error**\n\nI'm having trouble connecting to the Gemini AI service. Please check:\n\n• Backend server is running\n• API keys are configured correctly\n• Network connection is stable\n\nTry refreshing the page or asking a simpler question.`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "What is Somnia blockchain?",
    "Analyze Bitcoin trend",
    "Best Layer 2 solutions?",
    "How to manage crypto risk?",
    "Explain RSI indicator",
    "Portfolio rebalancing tips"
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const formatMessage = (content: string) => {
    // Enhanced markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 rounded text-green-300">$1</code>')
      .replace(/\n/g, '<br>')
      // Format bullet points
      .replace(/^- (.*)/gm, '• $1')
      .replace(/^• (.*)/gm, '<div class="ml-2">• $1</div>')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50 animate-pulse"
      >
        <div className="relative">
          <Bot className="w-7 h-7 text-white" />
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[550px] h-[700px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Somnia AI Assistant
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-xs text-white/70 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Powered by Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-3 border-b border-slate-700 bg-slate-800">
          <p className="text-xs text-slate-400 mb-2">💡 Quick questions to get started:</p>
          <div className="flex flex-wrap gap-1">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <div 
                className="text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              <p className="text-xs opacity-60 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-xs text-slate-400 ml-2">Somnia AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about crypto, trading, or Somnia blockchain..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform disabled:hover:scale-100"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          💎 Powered by Gemini AI & Somnia Blockchain • Responses in ~2-3 seconds
        </p>
      </div>
    </div>
  )
}