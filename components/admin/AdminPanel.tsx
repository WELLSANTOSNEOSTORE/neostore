'use client'

import { useState, useCallback } from 'react'
import { Day, Stats } from '@/types'
import StatsBar from './StatsBar'
import DayTabs from './DayTabs'
import ParticipantsTable from './ParticipantsTable'
import ExportTools from './ExportTools'
import RegistrationForm from '../registration/RegistrationForm'
import { Database, BarChart3, Wrench, UserPlus } from 'lucide-react'

type MobileTab = 'registrar' | 'banco' | 'resumo' | 'ferramentas'

interface AdminPanelProps {
  days: Day[]
  onDaysChange: (days: Day[]) => void
}

export default function AdminPanel({ days, onDaysChange }: AdminPanelProps) {
  const [activeDayId, setActiveDayId] = useState<string>(days[days.length - 1]?.id || '')
  const [mobileTab, setMobileTab] = useState<MobileTab>('banco')

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
    await Promise.all(day.participants.map(p =>
      fetch(`/api/participants/${p.id}`, { method: 'DELETE' })
    ))
    await refreshDays()
  }

  const handleClearOld = async () => {
    if (!confirm('Remover todos os dias anteriores ao atual?')) return
    const toDelete = days.filter(d => d.id !== activeDayId)
    await Promise.all(toDelete.map(d => fetch(`/api/days/${d.id}`, { method: 'DELETE' })))
    await refreshDays()
  }

  const handleTogglePresence = async (id: string) => {
    await fetch(`/api/participants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-presence' }),
    })
    await refreshDays()
  }

  const handleCheckout = async (id: string) => {
    await fetch(`/api/participants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkout' }),
    })
    await refreshDays()
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/participants/${id}`, { method: 'DELETE' })
    await refreshDays()
  }

  const handleImport = async (importedDays: Day[]) => {
    await refreshDays()
    if (importedDays.length > 0) setActiveDayId(importedDays[importedDays.length - 1].id)
  }

  // Auto-create day if none exist
  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-white/50 text-sm">Nenhum dia criado ainda.</p>
        <button onClick={handleNewDay} className="btn-primary" style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
          Criar Dia 1
        </button>
      </div>
    )
  }

  return (
    <>
      {/* DESKTOP layout */}
      <div className="hidden lg:flex gap-4 h-[calc(100vh-120px)]">
        {/* Left: form */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="glass-card p-5 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4" style={{ fontFamily: 'Syne' }}>
              Novo Participante
            </h3>
            {activeDayId && (
              <RegistrationForm dayId={activeDayId} onSuccess={refreshDays} />
            )}
          </div>
        </div>

        {/* Right: table + tools */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
          <StatsBar stats={stats} />
          <DayTabs
            days={days}
            activeDayId={activeDayId}
            onSelect={setActiveDayId}
            onNewDay={handleNewDay}
            onClearDay={handleClearDay}
            onClearOld={handleClearOld}
          />
          <div className="flex-1 min-h-0 glass-card p-4">
            <ParticipantsTable
              participants={participants}
              onTogglePresence={handleTogglePresence}
              onCheckout={handleCheckout}
              onRemove={handleRemove}
            />
          </div>
          <ExportTools days={days} activeDayId={activeDayId} onImport={handleImport} />
        </div>
      </div>

      {/* MOBILE layout */}
      <div className="lg:hidden flex flex-col gap-3 pb-20">
        {/* Stats always visible */}
        <StatsBar stats={stats} />
        <DayTabs
          days={days}
          activeDayId={activeDayId}
          onSelect={setActiveDayId}
          onNewDay={handleNewDay}
          onClearDay={handleClearDay}
          onClearOld={handleClearOld}
        />

        {/* Tab content */}
        {mobileTab === 'registrar' && (
          <div className="glass-card p-5 fade-in">
            {activeDayId && <RegistrationForm dayId={activeDayId} onSuccess={refreshDays} />}
          </div>
        )}
        {mobileTab === 'banco' && (
          <div className="glass-card p-3 fade-in" style={{ minHeight: 400 }}>
            <ParticipantsTable
              participants={participants}
              onTogglePresence={handleTogglePresence}
              onCheckout={handleCheckout}
              onRemove={handleRemove}
            />
          </div>
        )}
        {mobileTab === 'resumo' && (
          <div className="glass-card p-5 fade-in space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider" style={{ fontFamily: 'Syne' }}>
              Resumo por Tipo
            </h3>
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
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8b3cf7, #14d9b0)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {mobileTab === 'ferramentas' && (
          <div className="fade-in">
            <ExportTools days={days} activeDayId={activeDayId} onImport={handleImport} />
          </div>
        )}

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex"
          style={{ background: 'rgba(13,5,32,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { id: 'registrar', icon: UserPlus, label: 'Registrar' },
            { id: 'banco', icon: Database, label: 'Banco' },
            { id: 'resumo', icon: BarChart3, label: 'Resumo' },
            { id: 'ferramentas', icon: Wrench, label: 'Ferramentas' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all"
              style={{ color: mobileTab === id ? '#c4b5fd' : 'rgba(255,255,255,0.3)' }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
