import { NextResponse } from 'next/server'
import { setupAdminPin, isPinConfigured } from '@/lib/auth'

export async function POST(req: Request) {
  const { pin, currentPin } = await req.json()

  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN deve ter 4 dígitos' }, { status: 400 })
  }

  const configured = await isPinConfigured()
  if (configured && !currentPin) {
    return NextResponse.json({ error: 'PIN atual necessário para trocar' }, { status: 400 })
  }

  if (configured && currentPin) {
    const { verifyAdminPin } = await import('@/lib/auth')
    const valid = await verifyAdminPin(currentPin)
    if (!valid) {
      return NextResponse.json({ error: 'PIN atual incorreto' }, { status: 401 })
    }
  }

  await setupAdminPin(pin)
  return NextResponse.json({ ok: true })
}
