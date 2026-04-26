import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ImportRow {
  name: string
  email?: string
  phone?: string
  type?: string
  company?: string
  jobRole?: string
  notes?: string
}

export async function POST(req: Request) {
  const { dayId, rows } = await req.json()

  if (!dayId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows as ImportRow[]) {
    if (!row.name?.trim()) { skipped++; continue }

    const orConditions: object[] = [
      { name: { equals: row.name.trim(), mode: 'insensitive' } },
    ]
    if (row.email?.trim()) orConditions.push({ email: row.email.trim() })
    if (row.phone?.trim()) orConditions.push({ phone: row.phone.trim() })

    const duplicate = await prisma.participant.findFirst({
      where: { dayId, OR: orConditions },
    })

    if (duplicate) { skipped++; continue }

    const validTypes = ['Convidado', 'Palestrante', 'Jornalista', 'Staff']
    const type = validTypes.includes(row.type || '') ? row.type! : 'Convidado'

    try {
      await prisma.participant.create({
        data: {
          type,
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          company: row.company?.trim() || null,
          jobRole: row.jobRole?.trim() || null,
          notes: row.notes?.trim() || null,
          present: false,
          dayId,
        },
      })
      imported++
    } catch {
      errors.push(row.name)
      skipped++
    }
  }

  return NextResponse.json({ ok: true, imported, skipped, errors })
}
