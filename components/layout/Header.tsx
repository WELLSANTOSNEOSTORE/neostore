'use client'

import { Lock, Unlock } from 'lucide-react'

interface HeaderProps {
  isAdmin: boolean
  onLockClick: () => void
}

export default function Header({ isAdmin, onLockClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: 'rgba(13, 5, 32, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #8b3cf7, #14d9b0)' }}>
            N
          </div>
          <div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
              NEOSTORE
            </span>
            <span className="text-white/40 text-xs ml-1.5 hidden sm:inline">
              Credenciamento
            </span>
          </div>
        </div>

        {/* Admin lock */}
        <button
          onClick={onLockClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
          style={{
            background: isAdmin ? 'rgba(20, 217, 176, 0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isAdmin ? 'rgba(20, 217, 176, 0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: isAdmin ? '#14d9b0' : 'rgba(255,255,255,0.5)',
          }}
        >
          {isAdmin ? (
            <>
              <Unlock size={13} />
              <span className="hidden sm:inline">Admin</span>
            </>
          ) : (
            <>
              <Lock size={13} />
              <span className="hidden sm:inline">Admin</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
