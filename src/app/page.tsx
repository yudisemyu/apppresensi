import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CalendarDays, Plus, FileBarChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [sessionsCount, participantsCount, activeSessions] = await Promise.all([
    prisma.session.count(),
    prisma.participant.count(),
    prisma.session.findMany({ where: { status: 'OPEN' }, orderBy: { date: 'desc' } })
  ])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard KKN</h1>
        <div className="flex gap-4">
          <Link href="/participants">
            <Button variant="outline">Kelola Partisipan</Button>
          </Link>
          <Link href="/sessions">
            <Button variant="outline">Kelola Sesi</Button>
          </Link>
          <Link href="/recap">
            <Button variant="outline"><FileBarChart className="mr-2 h-4 w-4" /> Rekap</Button>
          </Link>
          <Link href="/sessions/new">
            <Button><Plus className="mr-2 h-4 w-4" /> Sesi Baru</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sesi Absensi
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sessionsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partisipan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{participantsCount}</div>
          </CardContent>
        </Card>
      </div>

      {activeSessions.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold border-b-2 border-black pb-2 inline-block">🔥 Sesi Aktif Saat Ini</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeSessions.map(session => (
              <Card key={session.id} className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <CardTitle>{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className="text-sm font-medium">{session.location}</span>
                  <Link href={`/sessions/${session.id}`}>
                    <Button variant="default" className="neo-shadow hover:neo-shadow-hover">Buka QR Code</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
