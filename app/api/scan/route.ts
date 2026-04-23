import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { participantId } = await req.json()

  if (!participantId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { day: { select: { label: true } } },
  })

  if (!participant) {
    return NextResponse.json({ error: 'Participante não encontrado' }, { status: 404 })
  }

  if (!participant.present) {
    await prisma.participant.update({
      where: { id: participantId },
      data: { present: true, checkinAt: new Date() },
    })
  }

  return NextResponse.json({
    id: participant.id,
    seq: participant.seq,
    name: participant.name,
    type: participant.type,
    company: participant.company,
    dayLabel: participant.day.label,
    alreadyCheckedIn: participant.present,
  })
}
