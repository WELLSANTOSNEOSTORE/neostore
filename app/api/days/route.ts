import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const days = await prisma.day.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      participants: { orderBy: { createdAt: 'asc' } },
    },
  })
  return NextResponse.json(days)
}

export async function POST(req: Request) {
  const { label } = await req.json()
  const count = await prisma.day.count()
  const day = await prisma.day.create({
    data: { label: label || `Dia ${count + 1}` },
    include: { participants: true },
  })
  return NextResponse.json(day, { status: 201 })
}
