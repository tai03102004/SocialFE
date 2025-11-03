'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AIChat from '@/components/AIChat'
import { Web3Provider } from '@/providers/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <div className="flex h-screen bg-gradient-to-br from-dark-bg via-dark-lighter to-dark-card text-white">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>

          {/* AI Chat Widget */}
          <AIChat />
        </Web3Provider>
      </body>
    </html>
  )
}
