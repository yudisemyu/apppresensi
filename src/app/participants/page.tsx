import { prisma } from '@/lib/prisma'
import ParticipantForm from '@/components/ParticipantForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { deleteParticipant } from '@/app/actions/participants'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParticipantsPage() {
  const participants = await prisma.participant.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 border-b-4 border-black pb-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="border-2 border-black neo-shadow"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight">Kelola Partisipan</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <ParticipantForm />
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Partisipan ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-black rounded-md mt-4">
                  <div className="text-muted-foreground font-medium">Belum ada partisipan.</div>
                </div>
              ) : (
                <Table className="mt-4 border-2 border-black">
                  <TableHeader className="bg-muted">
                    <TableRow className="border-b-2 border-black">
                      <TableHead className="font-bold text-black">Nama</TableHead>
                      <TableHead className="font-bold text-black">NIM</TableHead>
                      <TableHead className="w-[80px] text-right font-bold text-black">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p) => (
                      <TableRow key={p.id} className="border-b-2 border-black/10">
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell className="font-medium font-mono">{p.nim}</TableCell>
                        <TableCell className="text-right">
                          <form action={async () => {
                            'use server'
                            await deleteParticipant(p.id)
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
