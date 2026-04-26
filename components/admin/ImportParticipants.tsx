'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { X, Upload, CheckCircle, AlertCircle, FileSpreadsheet, Users } from 'lucide-react'

interface ImportRow {
  name: string
  email?: string
  phone?: string
  type?: string
  company?: string
  jobRole?: string
  notes?: string
}

interface ImportParticipantsProps {
  dayId: string
  dayLabel: string
  onClose: () => void
  onImported: () => void
}

const COLUMN_MAP: Record<string, keyof ImportRow> = {
  'nome': 'name', 'name': 'name',
  'email': 'email', 'e-mail': 'email',
  'telefone': 'phone', 'phone': 'phone', 'fone': 'phone', 'celular': 'phone', 'whatsapp': 'phone',
  'tipo': 'type', 'type': 'type',
  'empresa': 'company', 'company': 'company', 'emissora': 'company',
  'cargo': 'jobRole', 'função': 'jobRole', 'funcao': 'jobRole', 'jobrole': 'jobRole',
  'observações': 'notes', 'observacoes': 'notes', 'obs': 'notes', 'notes': 'notes',
}

function parseSheet(data: ArrayBuffer): ImportRow[] {
  const wb = XLSX.read(data, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

  return raw
    .map(row => {
      const mapped: Partial<ImportRow> = {}
      for (const [key, val] of Object.entries(row)) {
        const normalKey = key.toLowerCase().trim()
        const field = COLUMN_MAP[normalKey]
        if (field) mapped[field] = String(val).trim()
      }
      return mapped as ImportRow
    })
    .filter(r => r.name)
}

type Step = 'upload' | 'preview' | 'done'

export default function ImportParticipants({ dayId, dayLabel, onClose, onImported }: ImportParticipantsProps) {
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError('')
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = parseSheet(e.target!.result as ArrayBuffer)
        if (parsed.length === 0) {
          setError('Nenhum participante encontrado. Verifique se a planilha tem coluna "Nome".')
          return
        }
        setRows(parsed)
        setStep('preview')
      } catch {
        setError('Erro ao ler o arquivo. Use .xlsx ou .csv')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, rows }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao importar'); return }
      setResult({ imported: data.imported, skipped: data.skipped })
      setStep('done')
      onImported()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-card w-full max-w-lg fade-in overflow-hidden"
        style={{ border: '1px solid rgba(139,60,247,0.3)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} style={{ color: '#c4b5fd' }} />
            <span className="text-sm font-semibold text-white">Importar Lista</span>
            <span className="text-xs text-white/30">→ {dayLabel}</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">

          {/* STEP: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-xs text-white/40 text-center">
                Aceita <strong className="text-white/60">.xlsx</strong> ou <strong className="text-white/60">.csv</strong> com coluna <strong className="text-white/60">Nome</strong> obrigatória.
                Opcionais: Email, Telefone, Tipo, Empresa, Cargo.
              </p>

              <div
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
                style={{ borderColor: 'rgba(139,60,247,0.3)', background: 'rgba(139,60,247,0.04)' }}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-3" style={{ color: '#c4b5fd' }} />
                <p className="text-sm font-medium text-white/70">Arraste o arquivo aqui</p>
                <p className="text-xs text-white/30 mt-1">ou clique para selecionar</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>

              {/* Modelo de colunas */}
              <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/40 mb-2 uppercase tracking-wider font-semibold">Colunas aceitas na planilha</p>
                <div className="grid grid-cols-2 gap-1 text-white/50">
                  <span><span className="text-white/70">Nome</span> — obrigatório</span>
                  <span><span className="text-white/70">Email</span> — opcional</span>
                  <span><span className="text-white/70">Telefone</span> — opcional</span>
                  <span><span className="text-white/70">Tipo</span> — opcional</span>
                  <span><span className="text-white/70">Empresa</span> — opcional</span>
                  <span><span className="text-white/70">Cargo</span> — opcional</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {/* STEP: PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(139,60,247,0.08)', border: '1px solid rgba(139,60,247,0.2)' }}>
                <Users size={14} style={{ color: '#c4b5fd' }} />
                <span className="text-sm text-white/70">
                  <strong className="text-white">{rows.length}</strong> participantes encontrados na planilha
                </span>
              </div>

              <p className="text-xs text-white/40">Confira os dados antes de confirmar. Duplicatas serão ignoradas automaticamente.</p>

              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid text-xs font-semibold text-white/30 uppercase tracking-wider px-3 py-2"
                  style={{ gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255,255,255,0.03)' }}>
                  <span>Nome</span>
                  <span>Email</span>
                  <span>Telefone</span>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                  {rows.map((r, i) => (
                    <div key={i}
                      className="grid text-xs px-3 py-2 border-t"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr', borderColor: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-white/80 truncate pr-2">{r.name}</span>
                      <span className="text-white/40 truncate pr-2">{r.email || '—'}</span>
                      <span className="text-white/40 truncate">{r.phone || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep('upload'); setRows([]); setError('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  Voltar
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-2 flex-grow py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #8b3cf7, #14d9b0)', color: 'white' }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importando...</>
                    : <>Confirmar e Importar {rows.length} participantes</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && result && (
            <div className="text-center py-4 space-y-5 fade-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(20,217,176,0.15)', border: '2px solid #14d9b0' }}>
                <CheckCircle size={32} style={{ color: '#14d9b0' }} />
              </div>

              <div>
                <p className="text-lg font-bold text-white mb-1">Importação concluída!</p>
                <p className="text-xs text-white/40">Os participantes foram adicionados em <strong className="text-white/60">{dayLabel}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(20,217,176,0.08)', border: '1px solid rgba(20,217,176,0.2)' }}>
                  <p className="text-2xl font-black" style={{ color: '#14d9b0' }}>{result.imported}</p>
                  <p className="text-xs text-white/40 mt-1">Importados</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <p className="text-2xl font-black" style={{ color: '#fbbf24' }}>{result.skipped}</p>
                  <p className="text-xs text-white/40 mt-1">Ignorados (duplicata)</p>
                </div>
              </div>

              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-xs p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', color: 'rgba(251,191,36,0.7)' }}>
                  <AlertCircle size={13} />
                  Participantes com nome, email ou telefone já cadastrados foram ignorados.
                </div>
              )}

              <button onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(139,60,247,0.2)', border: '1px solid rgba(139,60,247,0.3)', color: '#c4b5fd' }}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
