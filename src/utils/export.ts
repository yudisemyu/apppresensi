import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// ─── Per-Session Export (Single Date) ───────────────────

export function exportToPDF(session: any) {
  const doc = new jsPDF()
  const dateStr = format(new Date(session.date), 'dd MMMM yyyy', { locale: localeId })
  const dayName = format(new Date(session.date), 'EEEE', { locale: localeId })

  // Title
  doc.setFontSize(14)
  doc.text('DAFTAR HADIR', 105, 20, { align: 'center' })
  doc.text('KULIAH KERJA NYATA (KKN)', 105, 28, { align: 'center' })

  doc.setFontSize(10)
  doc.line(40, 31, 170, 31)

  // Info section
  let yPos = 42
  const labelX = 14
  const valueX = 50

  doc.text('Kegiatan', labelX, yPos)
  doc.text(`: ${session.title}`, valueX, yPos)
  yPos += 8

  doc.text('Hari/Tanggal', labelX, yPos)
  doc.text(`: ${dayName}, ${dateStr}`, valueX, yPos)
  yPos += 8

  doc.text('Waktu', labelX, yPos)
  doc.text(`: ${session.startTime} - ${session.endTime} WIB`, valueX, yPos)
  yPos += 8

  doc.text('Tempat', labelX, yPos)
  doc.text(`: ${session.location}`, valueX, yPos)
  yPos += 8

  if (session.notes) {
    doc.text('Keterangan', labelX, yPos)
    doc.text(`: ${session.notes}`, valueX, yPos)
    yPos += 8
  }

  yPos += 6

  // Table header
  doc.setFontSize(9)
  const colNo = 14
  const colNama = 26
  const colNIM = 80
  const colWaktu = 110
  const colKet = 135
  const colTtd = 180

  // Header background
  doc.setFillColor(240, 240, 240)
  doc.rect(colNo - 1, yPos - 5, 187, 8, 'F')
  doc.setDrawColor(0)
  doc.rect(colNo - 1, yPos - 5, 187, 8)

  doc.setFontSize(9)
  doc.text('No', colNo, yPos)
  doc.text('Nama Lengkap', colNama, yPos)
  doc.text('NIM', colNIM, yPos)
  doc.text('Jam', colWaktu, yPos)
  doc.text('Keterangan', colKet, yPos)
  doc.text('Tanda Tangan', colTtd, yPos)

  yPos += 8

  // Table rows
  doc.setFontSize(9)
  session.attendances.forEach((att: any, idx: number) => {
    // Build keterangan: status + alasan
    const statusLabel = att.status === 'HADIR' ? 'Hadir' : att.status === 'IZIN' ? 'Izin' : att.status === 'SAKIT' ? 'Sakit' : 'Hadir'
    const reason = att.notes?.trim()
    const keterangan = reason ? `${statusLabel} - ${reason}` : statusLabel

    // Determine row height based on keterangan length
    const maxKetWidth = colTtd - colKet - 2
    const ketLines = doc.splitTextToSize(keterangan, maxKetWidth)
    const rowHeight = Math.max(8, ketLines.length * 5 + 3)

    // Row border
    doc.rect(colNo - 1, yPos - 5, 187, rowHeight)

    doc.text(`${idx + 1}`, colNo + 2, yPos)
    doc.text(att.participant.name.substring(0, 24), colNama, yPos)
    doc.text(att.participant.nim || '-', colNIM, yPos)
    doc.text(format(new Date(att.attendedAt), 'HH:mm'), colWaktu, yPos)
    doc.text(ketLines, colKet, yPos)

    yPos += rowHeight

    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
  })

  // Footer - signature area
  yPos += 16
  if (yPos > 240) {
    doc.addPage()
    yPos = 30
  }

  doc.setFontSize(10)
  doc.text(`${session.location}, ${dateStr}`, 130, yPos)
  yPos += 6
  doc.text('Mengetahui,', 130, yPos)
  yPos += 30
  doc.text('(______________________)', 130, yPos)
  yPos += 6
  doc.text('Dosen Pembimbing Lapangan', 130, yPos)

  doc.save(`Daftar_Hadir_KKN_${format(new Date(session.date), 'dd-MM-yyyy')}.pdf`)
}

export function exportToExcel(session: any) {
  const dateStr = format(new Date(session.date), 'dd MMMM yyyy', { locale: localeId })
  const dayName = format(new Date(session.date), 'EEEE', { locale: localeId })

  // Info rows at the top
  const infoRows = [
    ['DAFTAR HADIR KULIAH KERJA NYATA (KKN)'],
    [],
    ['Kegiatan', session.title],
    ['Hari/Tanggal', `${dayName}, ${dateStr}`],
    ['Waktu', `${session.startTime} - ${session.endTime} WIB`],
    ['Tempat', session.location],
    ...(session.notes ? [['Keterangan', session.notes]] : []),
    [],
    ['No', 'Nama Lengkap', 'NIM', 'Jam Hadir', 'Keterangan', 'Alasan', 'Tanda Tangan'],
  ]

  // Data rows
  const dataRows = session.attendances.map((att: any, idx: number) => {
    const statusText = att.status === 'HADIR' ? 'Hadir' : att.status === 'IZIN' ? 'Izin' : att.status === 'SAKIT' ? 'Sakit' : 'Hadir'
    return [
      idx + 1,
      att.participant.name,
      att.participant.nim || '-',
      format(new Date(att.attendedAt), 'HH:mm') + ' WIB',
      statusText,
      att.notes || '-',
      ''
    ]
  })

  const allRows = [...infoRows, ...dataRows]

  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Hadir')

  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 30 },
    { wch: 18 },
  ]

  // Merge title row
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
  ]

  XLSX.writeFile(workbook, `Daftar_Hadir_KKN_${format(new Date(session.date), 'dd-MM-yyyy')}.xlsx`)
}

// ─── Overall Recap Export ───────────────────────────────

export function exportOverallToPDF(sessions: any[], participants: any[]) {
  const doc = new jsPDF('landscape')

  // Title
  doc.setFontSize(14)
  doc.text('REKAP DAFTAR HADIR', 148, 16, { align: 'center' })
  doc.text('KULIAH KERJA NYATA (KKN)', 148, 24, { align: 'center' })
  doc.line(60, 27, 237, 27)

  doc.setFontSize(9)
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstDate = sortedSessions.length > 0 ? format(new Date(sortedSessions[0].date), 'dd MMMM yyyy', { locale: localeId }) : '-'
  const lastDate = sortedSessions.length > 0 ? format(new Date(sortedSessions[sortedSessions.length - 1].date), 'dd MMMM yyyy', { locale: localeId }) : '-'

  doc.text(`Periode: ${firstDate} s/d ${lastDate}`, 14, 34)
  doc.text(`Jumlah Pertemuan: ${sessions.length}`, 14, 40)
  doc.text(`Jumlah Peserta: ${participants.length}`, 14, 46)
  doc.text(`Dicetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: localeId })} WIB`, 200, 34)

  // Build attendance lookup
  const attendanceMap = new Map<string, Map<string, string>>()
  sessions.forEach((s) => {
    s.attendances.forEach((att: any) => {
      if (!attendanceMap.has(att.participantId)) {
        attendanceMap.set(att.participantId, new Map())
      }
      attendanceMap.get(att.participantId)!.set(s.id, att.status || 'HADIR')
    })
  })

  let yPos = 56

  // Table header
  doc.setFontSize(7)

  // Header background
  doc.setFillColor(240, 240, 240)
  doc.rect(13, yPos - 4, 274, 7, 'F')
  doc.rect(13, yPos - 4, 274, 7)

  doc.text('No', 14, yPos)
  doc.text('Nama Lengkap', 22, yPos)
  doc.text('NIM', 68, yPos)

  // Date column headers — use actual dates instead of "S1, S2..."
  const colStart = 94
  const maxCols = Math.floor((274 - (colStart - 13)) / 8)
  const displaySessions = sortedSessions.slice(0, maxCols)
  const colWidth = displaySessions.length > 0 ? Math.min(10, (274 - (colStart - 13) - 30) / displaySessions.length) : 10

  displaySessions.forEach((s, idx) => {
    const x = colStart + idx * colWidth
    if (x < 282) {
      // Show date as "8/7", "9/7", etc.
      const dateLabel = format(new Date(s.date), 'd/M')
      doc.text(dateLabel, x, yPos)
    }
  })

  const totalX = colStart + displaySessions.length * colWidth + 2
  if (totalX < 284) {
    doc.text('Hadir', totalX, yPos)
    doc.text('%', totalX + 14, yPos)
  }

  yPos += 7

  // Rows
  doc.setFontSize(7)
  participants.forEach((p, idx) => {
    // Alternating row color
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(13, yPos - 4, 274, 6, 'F')
    }
    doc.rect(13, yPos - 4, 274, 6)

    doc.text(`${idx + 1}`, 14, yPos)
    doc.text(p.name.substring(0, 22), 22, yPos)
    doc.text(p.nim, 68, yPos)

    const attended = attendanceMap.get(p.id) || new Map()
    let totalHadir = 0

    displaySessions.forEach((s, sIdx) => {
      const x = colStart + sIdx * colWidth
      if (x < 282) {
        if (attended.has(s.id)) {
          const status = attended.get(s.id)
          const mark = status === 'HADIR' ? 'H' : status === 'IZIN' ? 'I' : 'S'
          doc.text(mark, x + 1, yPos)
          if (status === 'HADIR') totalHadir++
        } else {
          doc.text('-', x + 1, yPos)
        }
      }
    })

    if (totalX < 284) {
      const pct = sessions.length > 0 ? Math.round((totalHadir / sessions.length) * 100) : 0
      doc.text(`${totalHadir}/${sessions.length}`, totalX, yPos)
      doc.text(`${pct}%`, totalX + 14, yPos)
    }

    yPos += 6

    if (yPos > 190) {
      doc.addPage('landscape')
      yPos = 20
    }
  })

  // Legend page — date details
  doc.addPage('landscape')
  doc.setFontSize(12)
  doc.text('Keterangan Pertemuan', 14, 16)

  doc.setFontSize(8)
  doc.text('H = Hadir    I = Izin    S = Sakit    - = Tidak Hadir', 14, 24)

  let legendY = 34
  doc.setFontSize(9)

  // Header
  doc.setFillColor(240, 240, 240)
  doc.rect(13, legendY - 4, 274, 7, 'F')
  doc.rect(13, legendY - 4, 274, 7)
  doc.text('No', 14, legendY)
  doc.text('Hari/Tanggal', 24, legendY)
  doc.text('Kegiatan', 80, legendY)
  doc.text('Waktu', 170, legendY)
  doc.text('Tempat', 210, legendY)
  doc.text('Jumlah Hadir', 260, legendY)
  legendY += 7

  sortedSessions.forEach((s, idx) => {
    const dayName = format(new Date(s.date), 'EEEE', { locale: localeId })
    const dateFormatted = format(new Date(s.date), 'dd MMMM yyyy', { locale: localeId })

    doc.rect(13, legendY - 4, 274, 6)
    doc.text(`${idx + 1}`, 14, legendY)
    doc.text(`${dayName}, ${dateFormatted}`, 24, legendY)
    doc.text(s.title.substring(0, 40), 80, legendY)
    doc.text(`${s.startTime} - ${s.endTime} WIB`, 170, legendY)
    doc.text(s.location.substring(0, 24), 210, legendY)
    doc.text(`${s.attendances.length} orang`, 260, legendY)
    legendY += 6

    if (legendY > 190) {
      doc.addPage('landscape')
      legendY = 20
    }
  })

  // Signature
  legendY += 14
  if (legendY > 170) {
    doc.addPage('landscape')
    legendY = 30
  }

  doc.setFontSize(10)
  const today = format(new Date(), 'dd MMMM yyyy', { locale: localeId })
  doc.text(`________________, ${today}`, 180, legendY)
  legendY += 6
  doc.text('Mengetahui,', 180, legendY)
  legendY += 30
  doc.text('(______________________)', 180, legendY)
  legendY += 6
  doc.text('Dosen Pembimbing Lapangan', 180, legendY)

  doc.save(`Rekap_Daftar_Hadir_KKN_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export function exportOverallToExcel(sessions: any[], participants: any[]) {
  // Build attendance lookup
  const attendanceMap = new Map<string, Map<string, any>>()
  sessions.forEach((s) => {
    s.attendances.forEach((att: any) => {
      if (!attendanceMap.has(att.participantId)) {
        attendanceMap.set(att.participantId, new Map())
      }
      attendanceMap.get(att.participantId)!.set(s.id, {
        status: att.status || 'HADIR',
        notes: att.notes
      })
    })
  })

  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstDate = sortedSessions.length > 0 ? format(new Date(sortedSessions[0].date), 'dd MMMM yyyy', { locale: localeId }) : '-'
  const lastDate = sortedSessions.length > 0 ? format(new Date(sortedSessions[sortedSessions.length - 1].date), 'dd MMMM yyyy', { locale: localeId }) : '-'

  // Info rows
  const headerCols = 3 + sortedSessions.length + 3
  const infoRows: any[][] = [
    ['REKAP DAFTAR HADIR KULIAH KERJA NYATA (KKN)'],
    [],
    ['Periode', `${firstDate} s/d ${lastDate}`],
    ['Jumlah Hari Absensi', sessions.length],
    ['Jumlah Peserta', participants.length],
    [],
  ]

  // Table header row — use dates as column headers
  const tableHeader: any[] = ['No', 'Nama Lengkap', 'NIM']
  sortedSessions.forEach((s) => {
    const dayName = format(new Date(s.date), 'EEE', { locale: localeId })
    const dateLabel = format(new Date(s.date), 'dd/MM')
    tableHeader.push(`${dayName} ${dateLabel}`)
  })
  tableHeader.push('Total Hadir', 'Total Hari Absensi', 'Persentase')
  infoRows.push(tableHeader)

  // Data rows
  const dataRows = participants.map((p, idx) => {
    const attended = attendanceMap.get(p.id) || new Map()
    const row: any[] = [idx + 1, p.name, p.nim]

    let totalHadir = 0
    sortedSessions.forEach((s) => {
      if (attended.has(s.id)) {
        const attData = attended.get(s.id)
        const st = attData.status
        const notes = attData.notes?.trim()
        
        let cellText = st === 'HADIR' ? 'Hadir' : st === 'IZIN' ? 'Izin' : st === 'SAKIT' ? 'Sakit' : 'Hadir'
        if ((st === 'IZIN' || st === 'SAKIT') && notes) {
          cellText += ` - ${notes}`
        }
        
        row.push(cellText)
        if (st === 'HADIR') totalHadir++
      } else {
        row.push('-')
      }
    })

    const pct = sessions.length > 0 ? Math.round((totalHadir / sessions.length) * 100) : 0
    row.push(totalHadir, sessions.length, `${pct}%`)
    return row
  })

  const allRows = [...infoRows, ...dataRows]

  const worksheet = XLSX.utils.aoa_to_sheet(allRows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Daftar Hadir')

  // Detail per-date sheet
  const detailRows: any[][] = [
    ['RINCIAN KEGIATAN PER TANGGAL'],
    [],
    ['No', 'Hari/Tanggal', 'Kegiatan', 'Waktu', 'Tempat', 'Jumlah Hadir', 'Keterangan']
  ]

  sortedSessions.forEach((s, idx) => {
    const dayName = format(new Date(s.date), 'EEEE', { locale: localeId })
    const dateFormatted = format(new Date(s.date), 'dd MMMM yyyy', { locale: localeId })
    detailRows.push([
      idx + 1,
      `${dayName}, ${dateFormatted}`,
      s.title,
      `${s.startTime} - ${s.endTime} WIB`,
      s.location,
      `${s.attendances.length} orang`,
      s.notes || '-'
    ])
  })

  const detailSheet = XLSX.utils.aoa_to_sheet(detailRows)
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Rincian Kegiatan')

  // Column widths
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 18 },
    ...sortedSessions.map(() => ({ wch: 20 })),
    { wch: 12 }, { wch: 18 }, { wch: 12 }
  ]

  detailSheet['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 14 }, { wch: 20 }
  ]

  // Merge title rows
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headerCols - 1 } }
  ]
  detailSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }
  ]

  XLSX.writeFile(workbook, `Rekap_Daftar_Hadir_KKN_${format(new Date(), 'dd-MM-yyyy')}.xlsx`)
}
