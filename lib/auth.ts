import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const setting = await prisma.settings.findUnique({ where: { key: 'admin_pin_hash' } })
  if (!setting) return false
  return bcrypt.compare(pin, setting.value)
}

export async function setupAdminPin(pin: string): Promise<void> {
  const hash = await bcrypt.hash(pin, 10)
  await prisma.settings.upsert({
    where: { key: 'admin_pin_hash' },
    update: { value: hash },
    create: { key: 'admin_pin_hash', value: hash },
  })
}

export async function isPinConfigured(): Promise<boolean> {
  const setting = await prisma.settings.findUnique({ where: { key: 'admin_pin_hash' } })
  return !!setting
}
