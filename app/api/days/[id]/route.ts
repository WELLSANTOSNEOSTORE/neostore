import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.day.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { label } = await req.json()
  const day = await prisma.day.update({
    where: { id: params.id },
    data: { label },
  })
  return NextResponse.json(day)
}
