'use client'

import { useState } from 'react'
import { LogOut, Trash2, Search, UserCheck, QrCode, Mail, MailCheck } from 'lucide-react'
import { Participant, ParticipantType, credentialId } from '@/types'
import { formatDateTime, formatDuration } from '@/lib/utils'
import QRCodeModal from './QRCodeModal'

const TYPE_FILTERS: (ParticipantType | 'Todos')[] = ['Todos', 'Convidado', 'Palestrante', 'Jornalista', 'Staff']

const BADGE_CLASS: Record<string, string> = {
  Convidado: 'badge-convidado',
  Palestrante: 'badge-palestrante',
  Jornalista: 'badge-jornalista',
  Staff: 'badge-staff',
}

interface ParticipantsTableProps {
  participants: Participant[]
  dayLabel: string
  onTogglePresence: (id: string) => void
  onCheckout: (id: string) => void
  onRemove: (id: string) => void
  onSendEmail: (id: string) => void
}

export default function ParticipantsTable({
  participants,
  dayLabel,
  onTogglePresence,
  onCheckout,
  onRemove,
  onSendEmail,
}: ParticipantsTableProps) {
  const [filter, setFilter] = useState<ParticipantType | 'Todos'>('Todos')
  const [search, setSearch] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [qrParticipant, setQrParticipant] = useState<Participant | null>(null)

  const filtered = participants.filter(p => {
    const matchType = filter === 'Todos' || p.type === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.company || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      credentialId(p.seq).toLowerCase().includes(q)
    return matchType && matchSearch
  })

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Buscar por nome, ID, empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={filter === t
                ? { background: 'rgba(139,60,247,0.3)', border: '1px solid rgba(139,60,247,0.5)', color: '#c4b5fd' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
              }>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <UserCheck size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Nenhum participante encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(139,60,247,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['ID', 'Nome', 'Tipo', 'Empresa', 'Telefone', 'Presença', 'Check-in', 'Check-out', 'Permanência', 'Ações'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,60,247,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>

                  {/* ID */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono font-bold" style={{ color: '#c4b5fd' }}>
                      {credentialId(p.seq)}
                    </span>
                  </td>

                  {/* Nome */}
                  <td className="px-3 py-3 font-medium text-white whitespace-nowrap max-w-[160px] truncate">{p.name}</td>

                  {/* Tipo */}
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_CLASS[p.type]}`}>{p.type}</span>
                  </td>

                  <td className="px-3 py-3 text-white/50 text-xs max-w-[110px] truncate">{p.company || '-'}</td>
                  <td className="px-3 py-3 text-white/50 text-xs whitespace-nowrap">{p.phone || '-'}</td>

                  {/* Presença */}
                  <td className="px-3 py-3">
                    <button onClick={() => onTogglePresence(p.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={p.present
                        ? { background: 'rgba(20,217,176,0.15)', border: '1px solid rgba(20,217,176,0.3)', color: '#5eead4' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
                      }>
                      {p.present ? '✓ Sim' : 'Não'}
                    </button>
                  </td>

                  <td className="px-3 py-3 text-white/50 text-xs whitespace-nowrap">{formatDateTime(p.checkinAt)}</td>
                  <td className="px-3 py-3 text-white/50 text-xs whitespace-nowrap">{formatDateTime(p.checkoutAt)}</td>
                  <td className="px-3 py-3 text-white/50 text-xs whitespace-nowrap">
                    {p.checkinAt && p.checkoutAt ? formatDuration(p.checkinAt, p.checkoutAt) : '-'}
                  </td>

                  {/* Ações */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {/* QR Code */}
                      <button onClick={() => setQrParticipant(p)} title="Ver QR Code"
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(139,60,247,0.12)', border: '1px solid rgba(139,60,247,0.25)', color: '#c4b5fd' }}>
                        <QrCode size={13} />
                      </button>

                      {/* Email */}
                      {p.email && (
                        <button onClick={() => onSendEmail(p.id)} title={p.emailSentAt ? 'Reenviar email' : 'Enviar credencial'}
                          className="p-1.5 rounded-lg transition-all"
                          style={p.emailSentAt
                            ? { background: 'rgba(20,217,176,0.12)', border: '1px solid rgba(20,217,176,0.25)', color: '#5eead4' }
                            : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                          }>
                          {p.emailSentAt ? <MailCheck size={13} /> : <Mail size={13} />}
                        </button>
                      )}

                      {/* Checkout */}
                      {!p.checkoutAt && p.present && (
                        <button onClick={() => onCheckout(p.id)} title="Registrar saída"
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                          <LogOut size={13} />
                        </button>
                      )}

                      {/* Remove */}
                      {confirmRemove === p.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => { onRemove(p.id); setConfirmRemove(null) }}
                            className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
                            Sim
                          </button>
                          <button onClick={() => setConfirmRemove(null)} className="px-2 py-1 rounded text-xs text-white/40">
                            Não
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmRemove(p.id)} title="Remover"
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-white/30 text-right">
        {filtered.length} de {participants.length} participante{participants.length !== 1 ? 's' : ''}
      </p>

      {qrParticipant && (
        <QRCodeModal
          participant={qrParticipant}
          dayLabel={dayLabel}
          onClose={() => setQrParticipant(null)}
        />
      )}
    </div>
  )
}
