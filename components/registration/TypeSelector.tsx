'use client'

import { ParticipantType } from '@/types'

const TYPES: { value: ParticipantType; label: string; color: string }[] = [
  { value: 'Convidado', label: 'Convidado', color: '#c4b5fd' },
  { value: 'Palestrante', label: 'Palestrante', color: '#5eead4' },
  { value: 'Jornalista', label: 'Jornalista', color: '#fcd34d' },
  { value: 'Staff', label: 'Staff', color: '#fca5a5' },
]

interface TypeSelectorProps {
  value: ParticipantType
  onChange: (v: ParticipantType) => void
}

export default function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map(t => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={
            value === t.value
              ? {
                  background: `linear-gradient(135deg, rgba(139,60,247,0.4), rgba(20,217,176,0.3))`,
                  border: `1px solid ${t.color}`,
                  color: t.color,
                  boxShadow: `0 0 16px ${t.color}30`,
                }
              : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                }
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
