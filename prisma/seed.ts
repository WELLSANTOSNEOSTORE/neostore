import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pin = process.env.ADMIN_PIN || '1234'
  const hash = await bcrypt.hash(pin, 10)

  await prisma.settings.upsert({
    where: { key: 'admin_pin_hash' },
    update: { value: hash },
    create: { key: 'admin_pin_hash', value: hash },
  })

  // Create first day if none
  const dayCount = await prisma.day.count()
  if (dayCount === 0) {
    await prisma.day.create({ data: { label: 'Dia 1' } })
  }

  console.log(`✓ PIN configurado: ${pin}`)
  console.log('✓ Banco inicializado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
