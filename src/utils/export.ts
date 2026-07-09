import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// ─── Per-Session Export ─────────────────────────────────

export function exportToPDF(session: any) {
  const doc = new jsPDF()
  
  doc.setFontSize(16)
  doc.text('Rekap Absensi KKN', 14, 20)
  
  doc.setFontSize(12)
  doc.text(`Kegiatan: ${session.title}`, 14, 30)
  doc.text(`Tanggal: ${format(new Date(session.date), 'dd MMMM yyyy', { locale: localeId })}`, 14, 38)
  doc.text(`Waktu: ${session.startTime} - ${session.endTime}`, 14, 46)
  doc.text(`Lokasi: ${session.location}`, 14, 54)
  
  doc.text('Daftar Hadir:', 14, 66)
  
  let yPos = 76
  doc.setFontSize(10)
  
  // Header Table
  doc.text('No', 14, yPos)
  doc.text('Nama', 30, yPos)
  doc.text('NIM', 100, yPos)
  doc.text('Waktu Hadir', 150, yPos)
  
  yPos += 2
  doc.line(14, yPos, 190, yPos)
  yPos += 8
  
  session.attendances.forEach((att: any, idx: number) => {
    doc.text(`${idx + 1}`, 14, yPos)
    doc.text(att.participant.name, 30, yPos)
    doc.text(att.participant.nim, 100, yPos)
    doc.text(format(new Date(att.attendedAt), 'HH:mm:ss'), 150, yPos)
    yPos += 8
    
    if (yPos > 280) {
      doc.addPage()
      yPos = 20
    }
  })
  
  doc.save(`Absensi_${session.title.replace(/\s+/g, '_')}_${format(new Date(session.date), 'yyyy-MM-dd')}.pdf`)
}

export function exportToExcel(session: any) {
  const worksheet = XLSX.utils.json_to_sheet(
    session.attendances.map((att: any, idx: number) => ({
      'No': idx + 1,
      'Nama': att.participant.name,
      'NIM': att.participant.nim,
      'Waktu Hadir': format(new Date(att.attendedAt), 'HH:mm:ss')
    }))
  )
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi')
  
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 }
  ]

  XLSX.writeFile(workbook, `Absensi_${session.title.replace(/\s+/g, '_')}_${format(new Date(session.date), 'yyyy-MM-dd')}.xlsx`)
}

// ─── Overall Recap Export ───────────────────────────────

export function exportOverallToPDF(sessions: any[], participants: any[]) {
  const doc = new jsPDF('landscape')

  doc.setFontSize(16)
  doc.text('Rekap Keseluruhan Absensi KKN', 14, 20)
  doc.setFontSize(10)
  doc.text(`Dicetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: localeId })}`, 14, 28)
  doc.text(`Total Sesi: ${sessions.length}  |  Total Partisipan: ${participants.length}`, 14, 35)

  // Build attendance lookup: participantId -> Set of sessionIds
  const attendanceMap = new Map<string, Set<string>>()
  sessions.forEach((s) => {
    s.attendances.forEach((att: any) => {
      if (!attendanceMap.has(att.participantId)) {
        attendanceMap.set(att.participantId, new Set())
      }
      attendanceMap.get(att.participantId)!.add(s.id)
    })
  })

  let yPos = 48

  // Header
  doc.setFontSize(8)
  doc.text('No', 14, yPos)
  doc.text('Nama', 24, yPos)
  doc.text('NIM', 74, yPos)

  // Session column headers (abbreviated)
  const colStart = 104
  const colWidth = Math.min(12, (280 - colStart) / Math.max(sessions.length, 1))
  sessions.forEach((s, idx) => {
    const x = colStart + idx * colWidth
    if (x < 280) {
      doc.text(`S${idx + 1}`, x, yPos)
    }
  })

  const totalX = colStart + sessions.length * colWidth
  if (totalX < 280) {
    doc.text('Total', totalX, yPos)
  }

  yPos += 2
  doc.line(14, yPos, 290, yPos)
  yPos += 6

  // Rows
  participants.forEach((p, idx) => {
    doc.text(`${idx + 1}`, 14, yPos)
    doc.text(p.name.substring(0, 25), 24, yPos)
    doc.text(p.nim, 74, yPos)

    const attended = attendanceMap.get(p.id) || new Set()
    let totalHadir = 0

    sessions.forEach((s, sIdx) => {
      const x = colStart + sIdx * colWidth
      if (x < 280) {
        if (attended.has(s.id)) {
          doc.text('✓', x + 1, yPos)
          totalHadir++
        } else {
          doc.text('-', x + 1, yPos)
        }
      }
    })

    if (totalX < 280) {
      doc.text(`${totalHadir}/${sessions.length}`, totalX, yPos)
    }

    yPos += 6

    if (yPos > 190) {
      doc.addPage('landscape')
      yPos = 20
    }
  })

  // Legend page
  doc.addPage('landscape')
  doc.setFontSize(12)
  doc.text('Keterangan Sesi:', 14, 20)
  doc.setFontSize(9)
  let legendY = 30
  sessions.forEach((s, idx) => {
    doc.text(
      `S${idx + 1}: ${s.title} — ${format(new Date(s.date), 'dd MMM yyyy', { locale: localeId })} (${s.location})`,
      14,
      legendY
    )
    legendY += 7
    if (legendY > 190) {
      doc.addPage('landscape')
      legendY = 20
    }
  })

  doc.save(`Rekap_Keseluruhan_Absensi_KKN_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

export function exportOverallToExcel(sessions: any[], participants: any[]) {
  // Build attendance lookup
  const attendanceMap = new Map<string, Set<string>>()
  sessions.forEach((s) => {
    s.attendances.forEach((att: any) => {
      if (!attendanceMap.has(att.participantId)) {
        attendanceMap.set(att.participantId, new Set())
      }
      attendanceMap.get(att.participantId)!.add(s.id)
    })
  })

  // Build rows
  const rows = participants.map((p, idx) => {
    const attended = attendanceMap.get(p.id) || new Set()
    const row: Record<string, any> = {
      'No': idx + 1,
      'Nama': p.name,
      'NIM': p.nim,
    }

    sessions.forEach((s, sIdx) => {
      const label = `S${sIdx + 1}: ${s.title.substring(0, 20)}`
      row[label] = attended.has(s.id) ? 'Hadir' : 'Tidak Hadir'
    })

    row['Total Hadir'] = attended.size
    row['Total Sesi'] = sessions.length
    row['Persentase'] = sessions.length > 0
      ? `${Math.round((attended.size / sessions.length) * 100)}%`
      : '0%'

    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Keseluruhan')

  // Session legend sheet
  const legendRows = sessions.map((s, idx) => ({
    'Kode': `S${idx + 1}`,
    'Kegiatan': s.title,
    'Tanggal': format(new Date(s.date), 'dd MMMM yyyy', { locale: localeId }),
    'Waktu': `${s.startTime} - ${s.endTime}`,
    'Lokasi': s.location,
    'Jumlah Hadir': s.attendances.length
  }))
  const legendSheet = XLSX.utils.json_to_sheet(legendRows)
  XLSX.utils.book_append_sheet(workbook, legendSheet, 'Keterangan Sesi')

  // Auto-width
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 20 },
    ...sessions.map(() => ({ wch: 14 })),
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ]

  XLSX.writeFile(workbook, `Rekap_Keseluruhan_Absensi_KKN_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}
