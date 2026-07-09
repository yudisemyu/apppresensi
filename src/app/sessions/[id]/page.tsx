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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Waktu Hadir</TableHead>
                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session.attendances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Belum ada yang hadir.
                      </TableCell>
                    </TableRow>
                  ) : (
                    session.attendances.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell className="font-medium">{att.participant.name}</TableCell>
                        <TableCell>{att.participant.nim}</TableCell>
                        <TableCell>{format(new Date(att.attendedAt), 'HH:mm:ss', { locale: localeId })}</TableCell>
                        <TableCell className="text-right">
                          <form action={async () => {
                            'use server'
                            await deleteAttendance(att.id, session.id)
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
