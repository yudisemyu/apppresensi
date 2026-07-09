'use server'

import { prisma } from '@/lib/prisma'

export async function getExportData(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      attendances: {
        include: { participant: true },
        orderBy: { attendedAt: 'asc' }
      }
    }
  })

  if (!session) {
    return { error: 'Sesi tidak ditemukan' }
  }

  return { session }
}

export async function getAllExportData() {
  const [sessions, participants] = await Promise.all([
    prisma.session.findMany({
      orderBy: { date: 'asc' },
      include: {
        attendances: {
          include: { participant: true },
          orderBy: { attendedAt: 'asc' }
        }
      }
    }),
    prisma.participant.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  return { sessions, participants }
}
