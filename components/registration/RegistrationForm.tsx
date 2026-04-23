'use client'

import { useState } from 'react'
import { CheckCircle, UserPlus } from 'lucide-react'
import TypeSelector from './TypeSelector'
import { RegistrationFormData, ParticipantType } from '@/types'
import { maskDate, maskPhone } from '@/lib/utils'

interface RegistrationFormProps {
  dayId: string
  onSuccess: () => void
}

const EMPTY: RegistrationFormData = {
  type: 'Convidado',
  name: '',
  birthDate: '',
  phone: '',
  company: '',
  jobRole: '',
  notes: '',
  checkInNow: false,
}

export default function RegistrationForm({ dayId, onSuccess }: RegistrationFormProps) {
  const [form, setForm] = useState<RegistrationFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof RegistrationFormData, v: string | boolean | ParticipantType) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dayId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao cadastrar')
        return
      }
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm(EMPTY)
        onSuccess()
      }, 2000)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(20,217,176,0.2), rgba(139,60,247,0.2))', border: '2px solid #14d9b0' }}>
          <CheckCircle size={40} style={{ color: '#14d9b0' }} />
        </div>
        <h3 className="text-xl font-bold" style={{ fontFamily: 'Syne', color: '#14d9b0' }}>
          Credenciado!
        </h3>
        <p className="text-white/50 text-sm text-center">
          {form.name} foi registrado com sucesso.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
          Tipo de Participante
        </label>
        <TypeSelector value={form.type} onChange={v => set('type', v)} />
      </div>

      {/* Nome */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          Nome Completo *
        </label>
        <input
          className="input-field"
          placeholder="Nome completo do participante"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoComplete="name"
        />
      </div>

      {/* Row: Data + Telefone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            Data de Nasc.
          </label>
          <input
            className="input-field"
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            value={form.birthDate}
            maxLength={10}
            onChange={e => set('birthDate', maskDate(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            Telefone
          </label>
          <input
            className="input-field"
            placeholder="(11) 99999-9999"
            inputMode="tel"
            value={form.phone}
            onChange={e => set('phone', maskPhone(e.target.value))}
          />
        </div>
      </div>

      {/* Row: Empresa + Cargo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            Empresa / Emissora
          </label>
          <input
            className="input-field"
            placeholder="Empresa"
            value={form.company}
            onChange={e => set('company', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            Cargo / Função
          </label>
          <input
            className="input-field"
            placeholder="Cargo"
            value={form.jobRole}
            onChange={e => set('jobRole', e.target.value)}
          />
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          Observações
        </label>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="Informações adicionais..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      {/* Check-in toggle */}
      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all"
        style={{ background: form.checkInNow ? 'rgba(20,217,176,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.checkInNow ? 'rgba(20,217,176,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
        <div className="toggle-switch">
          <input
            type="checkbox"
            checked={form.checkInNow}
            onChange={e => set('checkInNow', e.target.checked)}
          />
          <span className="toggle-slider" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">Confirmar presença agora</p>
          <p className="text-xs text-white/35">Registra check-in neste momento</p>
        </div>
      </label>

      {error && (
        <p className="text-sm text-center px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Credenciando...
          </span>
        ) : (
          <>
            <UserPlus size={18} />
            Credenciar Participante
          </>
        )}
      </button>
    </form>
  )
}
