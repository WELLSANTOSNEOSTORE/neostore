export function formatDuration(checkin: string, checkout: string): string {
  const start = new Date(checkin)
  const end = new Date(checkout)
  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) return '-'
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

export function calculateAge(birthDate: string): string {
  if (!birthDate || birthDate.length < 10) return '-'
  const [day, month, year] = birthDate.split('/')
  if (!day || !month || !year) return '-'
  const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return isNaN(age) ? '-' : String(age)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTimeFull(iso: string | null | undefined): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR')
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
