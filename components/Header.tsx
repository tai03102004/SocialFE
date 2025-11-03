'use client'

import { Menu, Bell } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-dark-card/50 backdrop-blur-xl border-b border-primary/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-dark-lighter rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold gradient-text">
              AI Trading Platform
            </h1>
            <p className="text-xs text-slate-400">Powered by Somnia Network</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-dark-lighter rounded-xl transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <ConnectButton
            chainStatus="icon"
            showBalance={true}
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </header>
  )
}
