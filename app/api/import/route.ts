import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ImportedParticipant {
  id: string
  type: string
  name: string
  birthDate?: string
  phone?: string
  company?: string
  jobRole?: string
  notes?: string
  present?: boolean
  checkinAt?: string
  checkoutAt?: string
  createdAt: string
}

interface ImportedDay {
  id: string
  label: string
  createdAt: string
  participants?: ImportedParticipant[]
}

export async function POST(req: Request) {
  const { days } = await req.json()

  if (!Array.isArray(days)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  let imported = 0

  for (const day of days as ImportedDay[]) {
    const existing = await prisma.day.findUnique({ where: { id: day.id } })

    if (!existing) {
      await prisma.day.create({
        data: {
          id: day.id,
          label: day.label,
          createdAt: new Date(day.createdAt),
          participants: {
            create: (day.participants || []).map(p => ({
              id: p.id,
              type: p.type,
              name: p.name,
              birthDate: p.birthDate || null,
              phone: p.phone || null,
              company: p.company || null,
              jobRole: p.jobRole || null,
              notes: p.notes || null,
              present: p.present || false,
              checkinAt: p.checkinAt ? new Date(p.checkinAt) : null,
              checkoutAt: p.checkoutAt ? new Date(p.checkoutAt) : null,
              createdAt: new Date(p.createdAt),
            })),
          },
        },
      })
      imported++
    }
  }

  return NextResponse.json({ ok: true, imported })
}
