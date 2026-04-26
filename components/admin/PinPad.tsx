'use client'

import { useState, useEffect } from 'react'
import { Delete } from 'lucide-react'

interface PinPadProps {
  onSuccess: () => void
  onClose: () => void
}

export default function PinPad({ onSuccess, onClose }: PinPadProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) submit(next)
  }

  const handleDelete = () => setPin(p => p.slice(0, -1))

  const submit = async (code: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        setError(data.error || 'PIN incorreto')
        setShake(true)
        setTimeout(() => { setShake(false); setPin('') }, 600)
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (loading) return
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleDelete()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pin, loading])

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`glass-card p-8 w-full max-w-xs fade-in ${shake ? 'animate-shake' : ''}`}
        style={{ border: '1px solid rgba(139, 60, 247, 0.3)', boxShadow: '0 0 60px rgba(139,60,247,0.2)' }}>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#c4b5fd' }}>
            Área Admin
          </h2>
          <p className="text-white/40 text-sm">Digite o PIN de 4 dígitos</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-4 h-4 rounded-full transition-all"
              style={{
                background: pin.length > i
                  ? 'linear-gradient(135deg, #8b3cf7, #14d9b0)'
                  : 'rgba(255,255,255,0.12)',
                boxShadow: pin.length > i ? '0 0 12px rgba(139,60,247,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm mb-4" style={{ color: 'var(--red)' }}>{error}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {digits.map((d, i) => (
            d === '' ? (
              <div key={i} />
            ) : d === '⌫' ? (
              <button key={i} className="pin-btn" onClick={handleDelete} disabled={loading}>
                <Delete size={18} />
              </button>
            ) : (
              <button key={i} className="pin-btn" onClick={() => handleDigit(d)} disabled={loading}>
                {d}
              </button>
            )
          ))}
        </div>

        <button onClick={onClose}
          className="w-full mt-6 py-2 text-sm text-white/30 hover:text-white/60 transition-colors">
          Cancelar
        </button>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
