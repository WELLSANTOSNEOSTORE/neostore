'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import PinPad from '@/components/admin/PinPad'
import RegistrationForm from '@/components/registration/RegistrationForm'
import AdminPanel from '@/components/admin/AdminPanel'
import { Day } from '@/types'

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [days, setDays] = useState<Day[]>([])
  const [activeDayId, setActiveDayId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  const fetchDays = async (currentActiveId?: string) => {
    try {
      const res = await fetch('/api/days')
      const data: Day[] = await res.json()
      setDays(data)
      const active = currentActiveId || activeDayId
      if (!active && data.length > 0) {
        setActiveDayId(data[data.length - 1].id)
      }
    } catch (e) {
      console.error('Erro ao carregar dias:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    fetch('/api/days')
      .then(r => r.json())
      .then(async (data: Day[]) => {
        if (data.length === 0) {
          const res = await fetch('/api/days', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: 'Dia 1' }),
          })
          const day = await res.json()
          setDays([{ ...day, participants: [] }])
          setActiveDayId(day.id)
        } else {
          setDays(data)
          setActiveDayId(data[data.length - 1].id)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLockClick = () => {
    if (isAdmin) setIsAdmin(false)
    else setShowPin(true)
  }

  const publicDay = days.find(d => d.id === activeDayId)

  return (
    <div className="min-h-dvh">
      <Header isAdmin={isAdmin} onLockClick={handleLockClick} />

      {showPin && (
        <PinPad onSuccess={() => { setIsAdmin(true); setShowPin(false) }} onClose={() => setShowPin(false)} />
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Carregando...</p>
            </div>
          </div>
        ) : isAdmin ? (
          <AdminPanel days={days} onDaysChange={setDays} />
        ) : (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(139,60,247,0.3), rgba(20,217,176,0.2))', border: '1px solid rgba(139,60,247,0.3)' }}>
                <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-syne, Syne)', background: 'linear-gradient(135deg, #c4b5fd, #14d9b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  N
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Credenciamento</h1>
              <p className="text-white/40 text-sm">
                {publicDay ? publicDay.label : 'Preencha seus dados para credenciar'}
              </p>
            </div>

            <div className="glass-card p-6">
              {activeDayId ? (
                <RegistrationForm dayId={activeDayId} onSuccess={() => fetchDays(activeDayId)} />
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  Aguarde o sistema inicializar...
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
