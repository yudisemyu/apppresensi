import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteSession } from '@/app/actions/sessions'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  })

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Sesi</h1>
        </div>
        <Link href="/sessions/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Buat Sesi Baru</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-card text-muted-foreground">
          Belum ada sesi yang dibuat.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{session.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.status === 'OPEN' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {session.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(session.date), 'dd MMMM yyyy', { locale: id })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{session.location}</span>
                </div>
                <div className="pt-2 font-medium text-foreground">
                  Hadir: {session._count.attendances} orang
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                <form action={async () => {
                  'use server'
                  await deleteSession(session.id)
                }}>
                  <Button variant="ghost" size="sm" type="submit" className="text-destructive h-8 px-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
                <Link href={`/sessions/${session.id}`} className="flex-grow">
                  <Button variant="outline" size="sm" className="w-full h-8">Detail Sesi</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
