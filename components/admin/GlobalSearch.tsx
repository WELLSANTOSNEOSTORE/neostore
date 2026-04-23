'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Day, Participant } from '@/types'

const BADGE_CLASS: Record<string, string> = {
  Convidado: 'badge-convidado',
  Palestrante: 'badge-palestrante',
  Jornalista: 'badge-jornalista',
  Staff: 'badge-staff',
}

interface Result extends Participant {
  dayLabel: string
}

export default function GlobalSearch({ days }: { days: Day[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const found: Result[] = []
    for (const day of days) {
      for (const p of day.participants) {
        const match =
          p.name.toLowerCase().includes(q) ||
          (p.company || '').toLowerCase().includes(q) ||
          (p.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          (p.jobRole || '').toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        if (match) found.push({ ...p, dayLabel: day.label })
      }
    }
    return found
  }, [query, days])

  const total = days.reduce((s, d) => s + d.participants.length, 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          className="input-field pl-10 pr-10"
          placeholder={`Buscar entre ${total} cadastrado${total !== 1 ? 's' : ''}...`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Estado vazio */}
      {query.length < 2 && (
        <div className="text-center py-10 text-white/25 text-sm">
          Digite pelo menos 2 caracteres para buscar
        </div>
      )}

      {/* Sem resultados */}
      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-10 text-white/30 text-sm">
          Nenhum resultado para <span className="text-white/50">&quot;{query}&quot;</span>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/35 px-1">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {results.map(p => (
              <div
                key={p.id}
                className="glass-card px-4 py-3 flex items-center gap-3 slide-in"
              >
                {/* Tipo badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${BADGE_CLASS[p.type]}`}>
                  {p.type}
                </span>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.company && (
                      <span className="text-xs text-white/45 truncate">{p.company}</span>
                    )}
                    {p.phone && (
                      <span className="text-xs text-white/30 flex-shrink-0">{p.phone}</span>
                    )}
                  </div>
                </div>

                {/* Dia + presença */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs text-white/35">{p.dayLabel}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={
                      p.present
                        ? { background: 'rgba(20,217,176,0.15)', color: '#5eead4' }
                        : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    {p.present ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
