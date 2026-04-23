import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  const { type, name, email, birthDate, phone, company, jobRole, notes, checkInNow, dayId } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  // Verificar duplicatas no mesmo dia
  const orConditions: object[] = [
    { name: { equals: name.trim(), mode: 'insensitive' } },
  ]
  if (email?.trim()) orConditions.push({ email: email.trim() })
  if (phone?.trim()) orConditions.push({ phone: phone.trim() })

  const duplicate = await prisma.participant.findFirst({
    where: { dayId, OR: orConditions },
  })

  if (duplicate) {
    let campo = 'Nome'
    const emailNorm = email?.trim()
    const phoneNorm = phone?.trim()
    if (emailNorm && duplicate.email === emailNorm) campo = 'Email'
    else if (phoneNorm && duplicate.phone === phoneNorm) campo = 'Telefone'
    return NextResponse.json({ error: `${campo} já cadastrado neste dia` }, { status: 409 })
  }

  const now = new Date()
  const participant = await prisma.participant.create({
    data: {
      type: type || 'Convidado',
      name: name.trim(),
      email: email?.trim() || null,
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
