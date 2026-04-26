'use client'

import { useState, useCallback } from 'react'
import { Day, Stats } from '@/types'
import StatsBar from './StatsBar'
import DayTabs from './DayTabs'
import ParticipantsTable from './ParticipantsTable'
import ExportTools from './ExportTools'
import GlobalSearch from './GlobalSearch'
import QRScanner from './QRScanner'
import EmailSender from './EmailSender'
import ImportParticipants from './ImportParticipants'
import RegistrationForm from '../registration/RegistrationForm'
import { Database, BarChart3, UserPlus, Search, Camera, Mail, FileSpreadsheet } from 'lucide-react'

type MobileTab = 'registrar' | 'banco' | 'buscar' | 'resumo'

interface AdminPanelProps {
  days: Day[]
  onDaysChange: (days: Day[]) => void
}

export default function AdminPanel({ days, onDaysChange }: AdminPanelProps) {
  const [activeDayId, setActiveDayId] = useState<string>(days[days.length - 1]?.id || '')
  const [mobileTab, setMobileTab] = useState<MobileTab>('banco')
  const [showScanner, setShowScanner] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const activeDay = days.find(d => d.id === activeDayId)
  const participants = activeDay?.participants || []

  const stats: Stats = {
    total: participants.length,
    present: participants.filter(p => p.present).length,
    exits: participants.filter(p => p.checkoutAt).length,
  }

  const refreshDays = useCallback(async () => {
    const res = await fetch('/api/days')
    const data = await res.json()
    onDaysChange(data)
  }, [onDaysChange])

  const handleNewDay = async () => {
    const res = await fetch('/api/days', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const day = await res.json()
    await refreshDays()
    setActiveDayId(day.id)
  }

  const handleClearDay = async (id: string) => {
    if (!confirm('Limpar todos os participantes deste dia?')) return
    const day = days.find(d => d.id === id)
    if (!day) return
    await Promise.all(day.participants.map(p => fetch(`/api/participants/${p.id}`, { method: 'DELETE' })))
    await refreshDays()
  }

  const handleClearOld = async () => {
    if (!confirm('Remover todos os dias anteriores ao atual?')) return
    await Promise.all(days.filter(d => d.id !== activeDayId).map(d => fetch(`/api/days/${d.id}`, { method: 'DELETE' })))
    await refreshDays()
  }

  const handleTogglePresence = async (id: string) => {
    await fetch(`/api/participants/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle-presence' }) })
    await refreshDays()
  }

  const handleCheckout = async (id: string) => {
    await fetch(`/api/participants/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'checkout' }) })
    await refreshDays()
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/participants/${id}`, { method: 'DELETE' })
    await refreshDays()
  }

  const handleSendEmail = async (id: string) => {
    await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantIds: [id] }) })
    await refreshDays()
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-white/50 text-sm">Nenhum dia criado ainda.</p>
        <button onClick={handleNewDay} className="btn-primary" style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}>Criar Dia 1</button>
      </div>
    )
  }

  const toolbarButtons = (
    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
      <button onClick={() => setShowScanner(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: 'rgba(196,181,253,0.1)', border: '1px solid rgba(196,181,253,0.25)', color: '#c4b5fd' }}>
        <Camera size={14} /> Scanner
      </button>
      <button onClick={() => setShowImport(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: 'rgba(139,60,247,0.1)', border: '1px solid rgba(139,60,247,0.25)', color: '#a78bfa' }}>
        <FileSpreadsheet size={14} /> Importar
      </button>
      <button onClick={() => setShowEmail(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: 'rgba(20,217,176,0.1)', border: '1px solid rgba(20,217,176,0.25)', color: '#5eead4' }}>
        <Mail size={14} /> Email
      </button>
      <ExportTools days={days} />
    </div>
  )

  return (
    <>
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} onCheckedIn={refreshDays} />
      )}
      {showEmail && (
        <EmailSender days={days} activeDayId={activeDayId} onClose={() => setShowEmail(false)} onSent={refreshDays} />
      )}
      {showImport && activeDay && (
        <ImportParticipants
          dayId={activeDayId}
          dayLabel={activeDay.label}
          onClose={() => setShowImport(false)}
          onImported={refreshDays}
        />
      )}

      {/* DESKTOP */}
      <div className="hidden lg:flex gap-4 h-[calc(100vh-120px)]">
        <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Novo Participante</h3>
            {activeDayId && <RegistrationForm dayId={activeDayId} onSuccess={refreshDays} />}
          </div>
          <div className="glass-card p-5 flex-1">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Busca Rápida</h3>
            <GlobalSearch days={days} />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1"><StatsBar stats={stats} /></div>
            {toolbarButtons}
          </div>
          <DayTabs days={days} activeDayId={activeDayId} onSelect={setActiveDayId}
            onNewDay={handleNewDay} onClearDay={handleClearDay} onClearOld={handleClearOld} />
          <div className="flex-1 min-h-0 glass-card p-4">
            <ParticipantsTable
              participants={participants}
              dayLabel={activeDay?.label || ''}
              onTogglePresence={handleTogglePresence}
              onCheckout={handleCheckout}
              onRemove={handleRemove}
              onSendEmail={handleSendEmail}
            />
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col gap-3 pb-20">
        <StatsBar stats={stats} />
        <DayTabs days={days} activeDayId={activeDayId} onSelect={setActiveDayId}
          onNewDay={handleNewDay} onClearDay={handleClearDay} onClearOld={handleClearOld} />

        {mobileTab === 'registrar' && (
          <div className="glass-card p-5 fade-in">
            {activeDayId && <RegistrationForm dayId={activeDayId} onSuccess={refreshDays} />}
          </div>
        )}

        {mobileTab === 'banco' && (
          <div className="glass-card p-3 fade-in" style={{ minHeight: 400 }}>
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(196,181,253,0.1)', border: '1px solid rgba(196,181,253,0.25)', color: '#c4b5fd' }}>
                  <Camera size={13} /> Scanner
                </button>
                <button onClick={() => setShowImport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(139,60,247,0.1)', border: '1px solid rgba(139,60,247,0.25)', color: '#a78bfa' }}>
                  <FileSpreadsheet size={13} /> Importar
                </button>
                <button onClick={() => setShowEmail(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(20,217,176,0.1)', border: '1px solid rgba(20,217,176,0.25)', color: '#5eead4' }}>
                  <Mail size={13} /> Email
                </button>
              </div>
              <ExportTools days={days} />
            </div>
            <ParticipantsTable
              participants={participants}
              dayLabel={activeDay?.label || ''}
              onTogglePresence={handleTogglePresence}
              onCheckout={handleCheckout}
              onRemove={handleRemove}
              onSendEmail={handleSendEmail}
            />
          </div>
        )}

        {mobileTab === 'buscar' && (
          <div className="glass-card p-4 fade-in">
            <GlobalSearch days={days} />
          </div>
        )}

        {mobileTab === 'resumo' && (
          <div className="glass-card p-5 fade-in space-y-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Resumo por Tipo</h3>
            {(['Convidado', 'Palestrante', 'Jornalista', 'Staff'] as const).map(type => {
              const count = participants.filter(p => p.type === type).length
              const pct = participants.length ? Math.round(count / participants.length * 100) : 0
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">{type}</span>
                    <span className="text-white/40">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8b3cf7, #14d9b0)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex"
          style={{ background: 'rgba(13,5,32,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { id: 'registrar', icon: UserPlus, label: 'Registrar' },
            { id: 'banco', icon: Database, label: 'Banco' },
            { id: 'buscar', icon: Search, label: 'Buscar' },
            { id: 'resumo', icon: BarChart3, label: 'Resumo' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setMobileTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all"
              style={{ color: mobileTab === id ? '#c4b5fd' : 'rgba(255,255,255,0.3)' }}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
