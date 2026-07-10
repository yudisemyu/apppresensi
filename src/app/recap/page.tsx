import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Users, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import OverallExportButton from '@/components/OverallExportButton'
import ExportButton from '@/components/ExportButton'

export const dynamic = 'force-dynamic'

export default async function RecapPage() {
  const [sessions, participants] = await Promise.all([
    prisma.session.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendances: {
          include: { participant: true }
        }
      }
    }),
    prisma.participant.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  // Build attendance lookup
  const attendanceMap = new Map<string, Map<string, string>>()
  sessions.forEach((s) => {
    s.attendances.forEach((att) => {
      if (!attendanceMap.has(att.participantId)) {
        attendanceMap.set(att.participantId, new Map())
      }
      attendanceMap.get(att.participantId)!.set(s.id, att.status || 'HADIR')
    })
  })

  let totalHadir = 0
  sessions.forEach(s => {
    totalHadir += s.attendances.filter(a => (a.status || 'HADIR') === 'HADIR').length
  })

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Rekap Absensi</h1>
        </div>
        <OverallExportButton />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sesi</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Partisipan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{participants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hadir</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHadir}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Attendance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriks Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 || sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 min-w-[40px]">No</TableHead>
                    <TableHead className="sticky left-[40px] bg-card z-10 min-w-[160px]">Nama</TableHead>
                    <TableHead className="sticky left-[200px] bg-card z-10 min-w-[100px]">NIM</TableHead>
                    {sessions.map((s, idx) => (
                      <TableHead key={s.id} className="text-center min-w-[80px]" title={`${s.title} - ${format(new Date(s.date), 'dd MMM yyyy', { locale: localeId })}`}>
                        S{idx + 1}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[80px] font-bold">Total</TableHead>
                    <TableHead className="text-center min-w-[80px] font-bold">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p, idx) => {
                    const attended = attendanceMap.get(p.id) || new Map()
                    const hadirCount = Array.from(attended.values()).filter(st => st === 'HADIR').length
                    const percentage = sessions.length > 0
                      ? Math.round((hadirCount / sessions.length) * 100)
                      : 0
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="sticky left-0 bg-card border-r-2 border-black">{idx + 1}</TableCell>
                        <TableCell className="sticky left-[40px] bg-card font-bold border-r-2 border-black">{p.name}</TableCell>
                        <TableCell className="sticky left-[200px] bg-card border-r-2 border-black">{p.nim}</TableCell>
                        {sessions.map((s) => {
                          const status = attended.get(s.id)
                          return (
                            <TableCell key={s.id} className="text-center font-bold border-r border-black/20">
                              {status === 'HADIR' ? (
                                <span className="text-primary">H</span>
                              ) : status === 'IZIN' ? (
                                <span className="text-yellow-500">I</span>
                              ) : status === 'SAKIT' ? (
                                <span className="text-red-500">S</span>
                              ) : (
                                <span className="text-muted-foreground font-normal">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-center font-bold border-l-2 border-black bg-muted/20">{hadirCount}/{sessions.length}</TableCell>
                        <TableCell className="text-center font-bold bg-muted/20">
                          <span className={`text-sm ${percentage >= 75 ? 'text-primary' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Keterangan Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Kode</TableHead>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-center">Hadir</TableHead>
                <TableHead className="text-right">Ekspor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">S{idx + 1}</TableCell>
                  <TableCell>{s.title}</TableCell>
                  <TableCell>{format(new Date(s.date), 'dd MMM yyyy', { locale: localeId })}</TableCell>
                  <TableCell>{s.startTime} - {s.endTime}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell className="text-center">{s.attendances.length}</TableCell>
                  <TableCell className="text-right">
                    <ExportButton sessionId={s.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
