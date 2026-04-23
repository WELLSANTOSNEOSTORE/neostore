import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  const { type, name, birthDate, phone, company, jobRole, notes, checkInNow, dayId } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const now = new Date()
  const participant = await prisma.participant.create({
    data: {
      type: type || 'Convidado',
      name: name.trim(),
      birthDate: birthDate || null,
      phone: phone || null,
      company: company || null,
      jobRole: jobRole || null,
      notes: notes || null,
      present: checkInNow || false,
      checkinAt: checkInNow ? now : null,
      dayId,
    },
  })

  return NextResponse.json(participant, { status: 201 })
}
