'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const sessionSchema = z.object({
  title: z.string().min(1, 'Judul kegiatan wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  notes: z.string().optional()
})

export async function createSession(data: z.infer<typeof sessionSchema>) {
  const parsed = sessionSchema.safeParse(data)
  
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const messages = Object.values(fieldErrors).flat().join(', ')
    return { error: messages || 'Data tidak valid' }
  }

  let sessionId: string

  try {
    const session = await prisma.session.create({
      data: {
        title: parsed.data.title,
        location: parsed.data.location,
        date: new Date(parsed.data.date),
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        notes: parsed.data.notes,
        status: 'CLOSED'
      }
    })
    sessionId = session.id
  } catch (e) {
    console.error("Prisma error:", e)
    return { error: 'Gagal membuat sesi' }
  }

  revalidatePath('/sessions')
  revalidatePath('/')
  return { success: true, sessionId }
}

export async function deleteSession(id: string) {
  try {
    await prisma.session.delete({ where: { id } })
    revalidatePath('/sessions')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { error: 'Gagal menghapus sesi' }
  }
}

export async function toggleSessionStatus(id: string, currentStatus: string) {
  try {
    await prisma.session.update({
      where: { id },
      data: { status: currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN' }
    })
    revalidatePath(`/sessions/${id}`)
    revalidatePath('/sessions')
    return { success: true }
  } catch (e) {
    return { error: 'Gagal mengubah status' }
  }
}

export async function deleteAttendance(id: string, sessionId: string) {
  try {
    await prisma.attendance.delete({ where: { id } })
    revalidatePath(`/sessions/${sessionId}`)
    return { success: true }
  } catch (e) {
    return { error: 'Gagal menghapus absensi' }
  }
}
