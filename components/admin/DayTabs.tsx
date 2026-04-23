'use client'

import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { Day } from '@/types'

interface DayTabsProps {
  days: Day[]
  activeDayId: string
  onSelect: (id: string) => void
  onNewDay: () => void
  onClearDay: (id: string) => void
  onClearOld: () => void
}

export default function DayTabs({ days, activeDayId, onSelect, onNewDay, onClearDay, onClearOld }: DayTabsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Tabs row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {days.map(d => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={
              d.id === activeDayId
                ? { background: 'linear-gradient(135deg, rgba(139,60,247,0.35), rgba(20,217,176,0.25))', border: '1px solid rgba(139,60,247,0.5)', color: '#c4b5fd' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
            }
          >
            {d.label}
            <span className="ml-1.5 text-xs opacity-60">({d.participants.length})</span>
          </button>
        ))}

        <button
          onClick={onNewDay}
          className="px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 flex-shrink-0"
          style={{ background: 'rgba(139,60,247,0.12)', border: '1px solid rgba(139,60,247,0.25)', color: '#8b3cf7' }}
        >
          <Plus size={14} />
          Novo Dia
        </button>
      </div>

      {/* Actions row */}
      {days.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onClearDay(activeDayId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
          >
            <Trash2 size={12} />
            Limpar dia ativo
          </button>
          {days.length > 1 && (
            <button
              onClick={onClearOld}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
            >
              <ChevronLeft size={12} />
              Limpar dias anteriores
            </button>
          )}
        </div>
      )}
    </div>
  )
}
