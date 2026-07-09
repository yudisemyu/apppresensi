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

export async function createSession(formData: FormData) {
  const data = {
    title: formData.get('title')?.toString() ?? '',
    location: formData.get('location')?.toString() ?? '',
    date: formData.get('date')?.toString() ?? '',
    startTime: formData.get('startTime')?.toString() ?? '',
    endTime: formData.get('endTime')?.toString() ?? '',
    notes: formData.get('notes')?.toString() ?? ''
  }
  const parsed = sessionSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Data tidak valid' }
  }

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
    revalidatePath('/sessions')
    revalidatePath('/')
    redirect(`/sessions/${session.id}`)
  } catch (e) {
    return { error: 'Gagal membuat sesi' }
  }
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
