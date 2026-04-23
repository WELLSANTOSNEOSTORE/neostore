import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { action, ...data } = body

  if (action === 'checkin') {
    const p = await prisma.participant.update({
      where: { id: params.id },
      data: { present: true, checkinAt: new Date() },
    })
    return NextResponse.json(p)
  }

  if (action === 'checkout') {
    const p = await prisma.participant.update({
      where: { id: params.id },
      data: { checkoutAt: new Date() },
    })
    return NextResponse.json(p)
  }

  if (action === 'toggle-presence') {
    const current = await prisma.participant.findUnique({ where: { id: params.id } })
    const p = await prisma.participant.update({
      where: { id: params.id },
      data: {
        present: !current?.present,
        checkinAt: !current?.present && !current?.checkinAt ? new Date() : current?.checkinAt,
      },
    })
    return NextResponse.json(p)
  }

  const p = await prisma.participant.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(p)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.participant.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
