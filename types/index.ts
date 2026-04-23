export type ParticipantType = 'Convidado' | 'Palestrante' | 'Jornalista' | 'Staff'

export interface Participant {
  id: string
  seq: number
  type: ParticipantType
  name: string
  email?: string | null
  birthDate?: string | null
  phone?: string | null
  company?: string | null
  jobRole?: string | null
  notes?: string | null
  present: boolean
  checkinAt?: string | null
  checkoutAt?: string | null
  emailSentAt?: string | null
  dayId: string
  createdAt: string
}

export interface Day {
  id: string
  label: string
  createdAt: string
  participants: Participant[]
}

export interface DaySummary {
  id: string
  label: string
  createdAt: string
  total: number
  present: number
  exits: number
}

export interface Stats {
  total: number
  present: number
  exits: number
}

export interface RegistrationFormData {
  type: ParticipantType
  name: string
  email: string
  birthDate: string
  phone: string
  company: string
  jobRole: string
  notes: string
  checkInNow: boolean
}

export interface ExportRow {
  '#': number
  'ID': string
  Nome: string
  Email: string
  Telefone: string
  Empresa: string
  Cargo: string
  Tipo: string
  'Data Nasc.': string
  Idade: string
  Dia: string
  Presente: string
  'Check-in': string
  'Check-out': string
  Permanência: string
  'Registrado em': string
  Observações: string
}

export function credentialId(seq: number): string {
  return `NEO-${seq.toString().padStart(4, '0')}`
}
