import * as XLSX from 'xlsx'
import { Participant, Day, ExportRow, credentialId } from '@/types'
import { calculateAge, formatDateTimeFull, formatDuration } from './utils'

function buildRows(participants: Participant[], dayLabel: string): ExportRow[] {
  return participants.map((p, i) => ({
    '#': i + 1,
    'ID': credentialId(p.seq),
    Nome: p.name,
    Email: p.email || '',
    Telefone: p.phone || '',
    Empresa: p.company || '',
    Cargo: p.jobRole || '',
    Tipo: p.type,
    'Data Nasc.': p.birthDate || '',
    Idade: p.birthDate ? calculateAge(p.birthDate) : '',
    Dia: dayLabel,
    Presente: p.present ? 'Sim' : 'Não',
    'Check-in': formatDateTimeFull(p.checkinAt),
    'Check-out': formatDateTimeFull(p.checkoutAt),
    Permanência: p.checkinAt && p.checkoutAt ? formatDuration(p.checkinAt, p.checkoutAt) : '-',
    'Registrado em': formatDateTimeFull(p.createdAt),
    Observações: p.notes || '',
  }))
}

export function exportToExcel(days: Day[]): void {
  const wb = XLSX.utils.book_new()

  const allRows: ExportRow[] = days.flatMap(d => buildRows(d.participants, d.label))
  const ws1 = XLSX.utils.json_to_sheet(allRows)
  XLSX.utils.book_append_sheet(wb, ws1, 'Lista de Presença')

  const summaryRows = days.map(d => ({
    Dia: d.label,
    Data: new Date(d.createdAt).toLocaleDateString('pt-BR'),
    Total: d.participants.length,
    Presentes: d.participants.filter(p => p.present).length,
    Saídas: d.participants.filter(p => p.checkoutAt).length,
    Convidados: d.participants.filter(p => p.type === 'Convidado').length,
    Palestrantes: d.participants.filter(p => p.type === 'Palestrante').length,
    Jornalistas: d.participants.filter(p => p.type === 'Jornalista').length,
    Staff: d.participants.filter(p => p.type === 'Staff').length,
  }))
  const ws2 = XLSX.utils.json_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumo por Dia')

  XLSX.writeFile(wb, `credenciamento-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
