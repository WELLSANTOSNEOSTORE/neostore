'use client'

import { Users, UserCheck, LogOut } from 'lucide-react'
import { Stats } from '@/types'

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Users, label: 'Total', value: stats.total, color: '#c4b5fd' },
        { icon: UserCheck, label: 'Presentes', value: stats.present, color: '#14d9b0' },
        { icon: LogOut, label: 'Saídas', value: stats.exits, color: '#fbbf24' },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="glass-card px-3 py-3 flex flex-col items-center gap-1">
          <Icon size={16} style={{ color }} />
          <span className="text-2xl font-bold" style={{ fontFamily: 'Syne', color }}>
            {value}
          </span>
          <span className="text-xs text-white/40">{label}</span>
        </div>
      ))}
    </div>
  )
}
