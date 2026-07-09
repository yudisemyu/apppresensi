import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AttendanceForm from '@/components/AttendanceForm'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function AttendPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  
  const [session, participants] = await Promise.all([
    prisma.session.findUnique({ where: { id: sessionId } }),
    prisma.participant.findMany({ orderBy: { name: 'asc' } })
  ])

  if (!session) {
    notFound()
  }

  if (session.status !== 'OPEN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA]">
        <Card className="max-w-md w-full text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl text-muted-foreground">Sesi Ditutup</CardTitle>
          </CardHeader>
          <CardContent>
            Sesi absensi untuk kegiatan ini belum dibuka atau sudah ditutup oleh admin.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAFAFA]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Absensi KKN</h1>
          <p className="text-muted-foreground text-sm">Silakan isi kehadiran Anda</p>
        </div>

        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
            <CardDescription className="flex flex-col gap-1.5 mt-2">
              <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {format(new Date(session.date), 'dd MMMM yyyy', { locale: localeId })}</span>
              <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {session.startTime} - {session.endTime}</span>
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {session.location}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AttendanceForm sessionId={session.id} participants={participants} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
