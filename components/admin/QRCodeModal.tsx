'use client'

import { X, Printer } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Participant, credentialId } from '@/types'

const BADGE_CLASS: Record<string, string> = {
  Convidado: 'badge-convidado',
  Palestrante: 'badge-palestrante',
  Jornalista: 'badge-jornalista',
  Staff: 'badge-staff',
}

interface QRCodeModalProps {
  participant: Participant
  dayLabel: string
  onClose: () => void
}

export default function QRCodeModal({ participant: p, dayLabel, onClose }: QRCodeModalProps) {
  const cid = credentialId(p.seq)

  const handlePrint = () => {
    const printContent = document.getElementById('credential-card')?.innerHTML
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win || !printContent) return
    win.document.write(`
      <html><head><title>Credencial ${cid}</title>
      <style>
        body { margin: 0; padding: 20px; background: #0d0520; font-family: Arial, sans-serif; color: white; display: flex; justify-content: center; }
        .card { background: linear-gradient(135deg,#1a0840,#0f1e3a); border: 1px solid rgba(139,60,247,.4); border-radius: 16px; padding: 24px; max-width: 280px; text-align: center; }
        @media print { body { background: white; } .card { border-color: #333; } }
      </style></head>
      <body>${printContent}</body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="glass-card w-full max-w-xs fade-in"
        style={{ border: '1px solid rgba(139,60,247,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span className="text-sm font-semibold text-white/70">Credencial</span>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Card content */}
        <div id="credential-card" className="p-5 text-center">
          <p className="text-xs text-white/35 uppercase tracking-widest mb-3">NEOSTORE</p>

          {/* QR Code */}
          <div className="bg-white p-3 rounded-xl inline-block mb-4">
            <QRCode value={p.id} size={160} />
          </div>

          {/* Credential ID */}
          <p className="text-2xl font-black tracking-wider mb-1"
            style={{ fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #c4b5fd, #14d9b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {cid}
          </p>

          {/* Name */}
          <p className="text-base font-semibold text-white mb-1 leading-tight">{p.name}</p>

          {/* Type badge */}
          <div className="flex justify-center mb-2">
            <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${BADGE_CLASS[p.type]}`}>
              {p.type}
            </span>
          </div>

          {p.company && <p className="text-xs text-white/40">{p.company}</p>}
          <p className="text-xs text-white/25 mt-1">{dayLabel}</p>
        </div>

        {/* Print button */}
        <div className="px-5 pb-5">
          <button onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(139,60,247,0.15)', border: '1px solid rgba(139,60,247,0.3)', color: '#c4b5fd' }}>
            <Printer size={14} />
            Imprimir credencial
          </button>
        </div>
      </div>
    </div>
  )
}
