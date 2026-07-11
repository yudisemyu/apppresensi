import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toggleSessionStatus, deleteAttendance } from '@/app/actions/sessions'
import QRCodeCard from '@/components/QRCodeCard'
import ExportButton from '@/components/ExportButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Trash2, Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { formatWIB } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      attendances: {
        include: { participant: true },
        orderBy: { attendedAt: 'desc' }
      }
    }
  })

  if (!session) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/sessions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight line-clamp-1">{session.title}</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Info Sesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(session.date), 'dd MMMM yyyy', { locale: localeId })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{session.startTime} - {session.endTime}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{session.location}</span>
              </div>
              {session.notes && (
                <div className="text-sm mt-4 p-3 bg-muted rounded-md border text-muted-foreground">
                  {session.notes}
                </div>
              )}
              
              <div className="pt-4 border-t mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Status: <span className={session.status === 'OPEN' ? 'text-success' : 'text-muted-foreground'}>{session.status}</span></span>
                <form action={async () => {
                  'use server'
                  await toggleSessionStatus(session.id, session.status)
                }}>
                  <Button type="submit" variant={session.status === 'OPEN' ? 'destructive' : 'default'} size="sm">
                    {session.status === 'OPEN' ? 'Tutup Sesi' : 'Buka Sesi'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <QRCodeCard sessionId={session.id} status={session.status} />
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Hadir ({session.attendances.length})</CardTitle>
              {session.attendances.length > 0 && <ExportButton sessionId={session.id} />}
            </CardHeader>
            <CardContent>
              {session.attendances.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-black rounded-md mt-4">
                  <div className="text-muted-foreground font-medium">Belum ada yang absen.</div>
                </div>
              ) : (
                <Table className="mt-4 border-2 border-black">
                  <TableHeader className="bg-muted">
                    <TableRow className="border-b-2 border-black">
                      <TableHead className="font-bold text-black">Nama</TableHead>
                      <TableHead className="font-bold text-black">Waktu</TableHead>
                      <TableHead className="font-bold text-black">Status</TableHead>
                      <TableHead className="font-bold text-black">Catatan</TableHead>
                      <TableHead className="w-[80px] text-right font-bold text-black">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.attendances.map((att) => (
                      <TableRow key={att.id} className="border-b-2 border-black/10">
                        <TableCell className="font-bold">
                          {att.participant.name}
                          <div className="text-xs font-mono font-medium text-muted-foreground mt-1">{att.participant.nim}</div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{formatWIB(att.attendedAt)}</TableCell>
                        <TableCell>
                          <span className={cn("px-2 py-1 rounded-sm text-xs font-bold border-2 border-black",
                            att.status === 'HADIR' ? 'bg-primary text-white' :
                            att.status === 'IZIN' ? 'bg-yellow-400 text-black' : 'bg-red-400 text-white'
                          )}>
                            {att.status || 'HADIR'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate" title={att.notes || '-'}>
                          {att.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={async () => {
                            'use server'
                            await deleteAttendance(att.id, session.id)
                          }}>
                            <Button variant="destructive" size="icon" type="submit" className="border-2 border-black neo-shadow hover:neo-shadow-hover h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
