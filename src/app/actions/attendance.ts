'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitAttendance(sessionId: string, participantId: string) {
  if (!sessionId || !participantId) {
    return { error: 'Data tidak lengkap' }
  }

  try {
    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    
    if (!session) {
      return { error: 'Sesi tidak ditemukan' }
    }
    
    if (session.status !== 'OPEN') {
      return { error: 'Sesi absensi sudah ditutup' }
    }

    await prisma.attendance.create({
      data: {
        sessionId,
        participantId
      }
    })
    
    revalidatePath(`/sessions/${sessionId}`)
    return { success: true }
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { error: 'Anda sudah melakukan absensi untuk sesi ini' }
    }
    return { error: 'Gagal merekam absensi' }
  }
}
