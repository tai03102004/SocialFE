'use client'

import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  History, 
  Database,
  Activity,
  TestTube2,
  Sparkles,
  Vote
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'blue' },
    { id: 'trading', icon: TrendingUp, label: 'Trading', path: '/trading', color: 'green' },
    { id: 'portfolio', icon: Wallet, label: 'Portfolio', path: '/portfolio', color: 'purple' },
    { id: 'history', icon: History, label: 'History', path: '/history', color: 'yellow' },
    { id: 'blockchain', icon: Database, label: 'Blockchain', path: '/blockchain', color: 'indigo' },
    { id: 'agents', icon: Activity, label: 'AI Agents', path: '/agents', color: 'pink' },
    { id: 'dao', icon: Vote, label: 'DAO', path: '/dao', color: 'pink' },
    { id: 'rewards', icon: Sparkles, label: 'Rewards', path: '/rewards', color: 'cyan' },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (!isOpen) return null
  if (!mounted) return null

  return (
    <aside className="w-64 bg-dark-card border-r border-primary/10 flex flex-col backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-primary/10">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => handleNavigation('/')}
        >
          <div className="w-10 h-10 bg-gradient-web3 rounded-xl flex items-center justify-center glow-blue group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg gradient-text">Somnia AI</h2>
            <p className="text-xs text-slate-400">Trading Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-gradient-web3 text-white shadow-lg glow-blue'
                  : 'text-slate-400 hover:bg-dark-lighter hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-primary/10">
        <div className="bg-dark-lighter rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">System Online</span>
          </div>
          <div className="text-xs text-slate-500">
            Somnia Testnet • Chain ID: 50312
          </div>
        </div>
      </div>
    </aside>
  )
}
