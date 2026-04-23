'use client'

import { useState } from 'react'
import { Mail, Send, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Day } from '@/types'

interface EmailSenderProps {
  days: Day[]
  activeDayId: string
  onClose: () => void
  onSent: () => void
}

export default function EmailSender({ days, activeDayId, onClose, onSent }: EmailSenderProps) {
  const [mode, setMode] = useState<'day' | 'all'>('day')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  const activeDay = days.find(d => d.id === activeDayId)
  const allWithEmail = days.flatMap(d => d.participants).filter(p => p.email)
  const dayWithEmail = (activeDay?.participants || []).filter(p => p.email)

  const targets = mode === 'day' ? dayWithEmail : allWithEmail
  const noEmail = mode === 'day'
    ? (activeDay?.participants || []).filter(p => !p.email).length
    : days.flatMap(d => d.participants).filter(p => !p.email).length

  const handleSend = async () => {
    setLoading(true)
    setError('')
    try {
      const body = mode === 'day'
        ? { dayId: activeDayId }
        : { participantIds: allWithEmail.map(p => p.id) }

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ sent: data.sent, failed: data.failed })
        onSent()
      } else {
        setError(data.error || 'Erro ao enviar')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="glass-card w-full max-w-sm fade-in"
        style={{ border: '1px solid rgba(139,60,247,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Mail size={16} style={{ color: '#c4b5fd' }} />
            <span className="text-sm font-semibold text-white">Disparar Emails</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>

        {result ? (
          /* Resultado */
          <div className="p-6 text-center fade-in">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#14d9b0' }} />
            <p className="text-base font-semibold text-white mb-1">Envio concluído</p>
            <p className="text-sm text-white/50 mb-1">
              <span style={{ color: '#14d9b0' }}>{result.sent} email(s)</span> enviado(s) com sucesso
            </p>
            {result.failed > 0 && (
              <p className="text-sm" style={{ color: '#f87171' }}>{result.failed} falhou</p>
            )}
            <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(20,217,176,0.15)', border: '1px solid rgba(20,217,176,0.3)', color: '#14d9b0' }}>
              Fechar
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Modo */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Destinatários</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'day', label: activeDay?.label || 'Dia ativo', count: dayWithEmail.length },
                  { id: 'all', label: 'Todos os dias', count: allWithEmail.length },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id as 'day' | 'all')}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all"
                    style={mode === opt.id
                      ? { background: 'rgba(139,60,247,0.25)', border: '1px solid rgba(139,60,247,0.5)', color: '#c4b5fd' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    <span className="text-xl font-black" style={{ fontFamily: 'Syne' }}>{opt.count}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl p-3 space-y-1.5 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between">
                <span className="text-white/40">Com email cadastrado</span>
                <span style={{ color: '#14d9b0' }}>{targets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Sem email</span>
                <span className="text-white/30">{noEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Conteúdo</span>
                <span className="text-white/50">Credencial + QR Code</span>
              </div>
            </div>

            {noEmail > 0 && targets.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                <AlertCircle size={14} />
                Nenhum participante com email cadastrado neste grupo.
              </div>
            )}

            {error && (
              <p className="text-xs text-center px-3 py-2 rounded-lg"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={loading || targets.length === 0}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</>
              ) : (
                <><Send size={15} />Enviar para {targets.length} participante{targets.length !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
