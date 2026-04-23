import { NextResponse } from 'next/server'
import { verifyAdminPin, isPinConfigured } from '@/lib/auth'

export async function POST(req: Request) {
  const { pin } = await req.json()
  if (!pin || pin.length !== 4) {
    return NextResponse.json({ error: 'PIN inválido' }, { status: 400 })
  }
  const configured = await isPinConfigured()
  if (!configured) {
    return NextResponse.json({ error: 'PIN não configurado' }, { status: 404 })
  }
  const valid = await verifyAdminPin(pin)
  if (!valid) {
    return NextResponse.json({ error: 'PIN incorreto' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
