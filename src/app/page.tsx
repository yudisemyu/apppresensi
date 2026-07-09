import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CalendarDays, Plus, FileBarChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [sessionsCount, participantsCount] = await Promise.all([
    prisma.session.count(),
    prisma.participant.count(),
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
    </div>
  )
}
