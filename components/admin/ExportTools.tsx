'use client'

import { useState } from 'react'
import { Download, Upload, FileSpreadsheet, FileText, FileJson, File } from 'lucide-react'
import { Day } from '@/types'
import { exportToExcel, exportToCSV, exportToTXT, exportToJSON } from '@/lib/export'

interface ExportToolsProps {
  days: Day[]
  activeDayId: string
  onImport: (days: Day[]) => void
}

export default function ExportTools({ days, activeDayId, onImport }: ExportToolsProps) {
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState('')

  const activeDay = days.find(d => d.id === activeDayId)

  const flash = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: json.days }),
        })
        const data = await res.json()
        if (res.ok) {
          flash(`✓ ${data.imported} dia(s) importado(s)`)
          onImport(json.days)
        } else {
          flash(`Erro: ${data.error}`)
        }
      } catch {
        flash('Arquivo inválido')
      } finally {
        setImporting(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const buttons = [
    {
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      color: '#10d9a0',
      onClick: () => { exportToExcel(days); flash('✓ Excel exportado') },
    },
    {
      label: 'CSV',
      icon: File,
      color: '#c4b5fd',
      onClick: () => { if (activeDay) exportToCSV(activeDay.participants, activeDay.label); flash('✓ CSV exportado') },
    },
    {
      label: 'Resumo TXT',
      icon: FileText,
      color: '#fbbf24',
      onClick: () => { exportToTXT(days); flash('✓ TXT exportado') },
    },
    {
      label: 'Backup JSON',
      icon: FileJson,
      color: '#8b3cf7',
      onClick: () => { exportToJSON(days); flash('✓ JSON exportado') },
    },
  ]

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Download size={15} style={{ color: '#c4b5fd' }} />
        <h3 className="text-sm font-semibold text-white/80" style={{ fontFamily: 'Syne' }}>Exportar dados</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {buttons.map(({ label, icon: Icon, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-xs font-medium"
            style={{
              background: `rgba(${hexToRgb(color)}, 0.08)`,
              border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
              color,
            }}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Upload size={15} style={{ color: '#fbbf24' }} />
          <h3 className="text-sm font-semibold text-white/80" style={{ fontFamily: 'Syne' }}>Importar JSON</h3>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          <Upload size={14} />
          {importing ? 'Importando...' : 'Selecionar arquivo JSON'}
          <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
        </label>
      </div>

      {msg && (
        <p className="text-xs text-center py-2 px-3 rounded-lg fade-in"
          style={{ background: msg.startsWith('✓') ? 'rgba(20,217,176,0.1)' : 'rgba(248,113,113,0.1)', color: msg.startsWith('✓') ? '#14d9b0' : '#f87171' }}>
          {msg}
        </p>
      )}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
