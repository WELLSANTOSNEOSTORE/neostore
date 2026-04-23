import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

function credentialId(seq: number) {
  return `NEO-${seq.toString().padStart(4, '0')}`
}

async function buildEmailHtml(p: {
  seq: number
  name: string
  type: string
  company: string | null
  jobRole: string | null
  id: string
  dayLabel: string
}): Promise<string> {
  const credId = credentialId(p.seq)
  const qrDataUrl = await QRCode.toDataURL(p.id, { width: 200, margin: 2, color: { dark: '#1a0840', light: '#ffffff' } })

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #0d0520; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .container { max-width: 480px; margin: 0 auto; padding: 32px 16px; }
  .card { background: linear-gradient(135deg, #1a0840 0%, #0f1e3a 100%); border-radius: 20px; border: 1px solid rgba(139,60,247,0.3); padding: 32px; text-align: center; }
  .logo { font-size: 13px; font-weight: 800; color: #c4b5fd; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px; }
  .greeting { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 28px; }
  .qr-wrap { background: white; display: inline-block; border-radius: 16px; padding: 16px; margin-bottom: 20px; }
  .cred-id { font-size: 28px; font-weight: 800; letter-spacing: 2px; background: linear-gradient(135deg, #c4b5fd, #14d9b0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .info-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1px; }
  .info-value { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(139,60,247,0.2); color: #c4b5fd; border: 1px solid rgba(139,60,247,0.3); }
  .footer { margin-top: 24px; font-size: 11px; color: rgba(255,255,255,0.2); }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">NEOSTORE</div>
      <div class="greeting">Olá, ${p.name.split(' ')[0]}!</div>
      <div class="subtitle">Seu credencial está confirmado</div>

      <div class="qr-wrap">
        <img src="${qrDataUrl}" width="180" height="180" alt="QR Code" style="display:block;" />
      </div>

      <div class="cred-id">${credId}</div>

      <div style="text-align:left; margin-bottom: 20px;">
        <div class="info-row">
          <span class="info-label">Tipo</span>
          <span class="badge">${p.type}</span>
        </div>
        ${p.company ? `<div class="info-row"><span class="info-label">Empresa</span><span class="info-value">${p.company}</span></div>` : ''}
        ${p.jobRole ? `<div class="info-row"><span class="info-label">Cargo</span><span class="info-value">${p.jobRole}</span></div>` : ''}
        <div class="info-row">
          <span class="info-label">Evento</span>
          <span class="info-value">${p.dayLabel}</span>
        </div>
      </div>

      <div class="footer">
        Apresente este QR Code na entrada do evento.<br/>
        Neostore Credenciamento
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: Request) {
  const { participantIds, dayId } = await req.json()

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 })
  }

  let targets: { id: string; seq: number; name: string; email: string | null; type: string; company: string | null; jobRole: string | null; dayLabel: string }[] = []

  if (dayId) {
    const day = await prisma.day.findUnique({
      where: { id: dayId },
      include: { participants: true },
    })
    if (!day) return NextResponse.json({ error: 'Dia não encontrado' }, { status: 404 })
    targets = day.participants
      .filter(p => p.email)
      .map(p => ({ ...p, dayLabel: day.label }))
  } else if (Array.isArray(participantIds)) {
    const participants = await prisma.participant.findMany({
      where: { id: { in: participantIds } },
      include: { day: { select: { label: true } } },
    })
    targets = participants
      .filter(p => p.email)
      .map(p => ({ ...p, dayLabel: p.day.label }))
  }

  if (targets.length === 0) {
    return NextResponse.json({ error: 'Nenhum participante com email válido' }, { status: 400 })
  }

  const results = await Promise.allSettled(
    targets.map(async p => {
      const html = await buildEmailHtml(p)
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Neostore <onboarding@resend.dev>',
        to: p.email!,
        subject: `Seu Credencial ${credentialId(p.seq)} — ${p.dayLabel}`,
        html,
      })
      await prisma.participant.update({
        where: { id: p.id },
        data: { emailSentAt: new Date() },
      })
      return p.id
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ ok: true, sent, failed })
}
