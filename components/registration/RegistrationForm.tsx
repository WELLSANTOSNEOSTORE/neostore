'use client'

import { useState } from 'react'
import { CheckCircle, UserPlus } from 'lucide-react'
import QRCode from 'react-qr-code'
import TypeSelector from './TypeSelector'
import { RegistrationFormData, ParticipantType, Participant, credentialId } from '@/types'
import { maskDate, maskPhone } from '@/lib/utils'

interface RegistrationFormProps {
  dayId: string
  onSuccess: () => void
}

const EMPTY: RegistrationFormData = {
  type: 'Convidado',
  name: '',
  email: '',
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
  const [created, setCreated] = useState<Participant | null>(null)
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
      const participant = await res.json()
      setCreated(participant)
      onSuccess()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setCreated(null)
    setForm(EMPTY)
  }

  if (created) {
    const cid = credentialId(created.seq)
    return (
      <div className="flex flex-col items-center gap-5 py-4 fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} style={{ color: '#14d9b0' }} />
          <span className="text-sm font-semibold" style={{ color: '#14d9b0' }}>Credenciado com sucesso!</span>
        </div>

        {/* Mini credential card */}
        <div className="w-full rounded-2xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(139,60,247,0.12), rgba(20,217,176,0.08))', border: '1px solid rgba(139,60,247,0.25)' }}>
          <p className="text-xs text-white/35 uppercase tracking-widest mb-3">NEOSTORE</p>
          <div className="bg-white p-2.5 rounded-xl inline-block mb-3">
            <QRCode value={created.id} size={120} />
          </div>
          <p className="text-xl font-black tracking-wider"
            style={{ fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #c4b5fd, #14d9b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {cid}
          </p>
          <p className="text-sm font-semibold text-white mt-1">{created.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{created.type}</p>
        </div>

        <button onClick={handleNext} className="btn-primary flex items-center justify-center gap-2">
          <UserPlus size={16} />
          Cadastrar próximo
        </button>
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
          placeholder="Nome completo"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          className="input-field"
          type="email"
          placeholder="email@exemplo.com"
          inputMode="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          autoComplete="email"
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
          <input className="input-field" placeholder="Empresa" value={form.company} onChange={e => set('company', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            Cargo / Função
          </label>
          <input className="input-field" placeholder="Cargo" value={form.jobRole} onChange={e => set('jobRole', e.target.value)} />
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          Observações
        </label>
        <textarea className="input-field resize-none" rows={2} placeholder="Informações adicionais..."
          value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {/* Check-in toggle */}
      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all"
        style={{ background: form.checkInNow ? 'rgba(20,217,176,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.checkInNow ? 'rgba(20,217,176,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
        <div className="toggle-switch">
          <input type="checkbox" checked={form.checkInNow} onChange={e => set('checkInNow', e.target.checked)} />
          <span className="toggle-slider" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">Confirmar presença agora</p>
          <p className="text-xs text-white/35">Registra check-in neste momento</p>
        </div>
      </label>

      {error && (
        <p className="text-sm text-center px-3 py-2 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Credenciando...</>
        ) : (
          <><UserPlus size={18} />Credenciar Participante</>
        )}
      </button>
    </form>
  )
}
