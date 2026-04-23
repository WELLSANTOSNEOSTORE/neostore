'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Day } from '@/types'
import { exportToExcel } from '@/lib/export'

interface ExportToolsProps {
  days: Day[]
}

export default function ExportTools({ days }: ExportToolsProps) {
  const [msg, setMsg] = useState('')

  const handleExport = () => {
    exportToExcel(days)
    setMsg('✓ Excel exportado')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'rgba(16, 217, 160, 0.1)',
          border: '1px solid rgba(16, 217, 160, 0.25)',
          color: '#10d9a0',
        }}
      >
        <FileSpreadsheet size={16} />
        Exportar Excel
      </button>

      {msg && (
        <span className="text-xs fade-in" style={{ color: '#10d9a0' }}>{msg}</span>
      )}
    </div>
  )
}
