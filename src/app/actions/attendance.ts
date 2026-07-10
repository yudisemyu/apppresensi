'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isWithinRadius } from '@/lib/geo'

export async function submitAttendance(
  sessionId: string, 
  participantId: string,
  lat?: number,
  lng?: number,
  status: string = "HADIR",
  notes?: string
) {
  if (!sessionId || !participantId) {
    return { error: 'Data tidak lengkap' }
  }

  try {
    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    
    if (!session) {
      return { error: 'Sesi tidak ditemukan' }
    }
    
    if (session.status !== 'OPEN') {
      return { error: 'Sesi absensi sudah ditutup (Manual)' }
    }

    // Validasi Waktu
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    const [startH, startM] = session.startTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const [endH, endM] = session.endTime.split(':').map(Number)
    const endMinutes = endH * 60 + endM

    if (currentMinutes < startMinutes) {
      return { error: `Sesi baru akan dibuka pukul ${session.startTime}` }
    }
    if (currentMinutes > endMinutes) {
      return { error: `Batas waktu absen (deadline) sudah lewat sejak pukul ${session.endTime}` }
    }

    // Validasi Jarak (Hanya jika status HADIR)
    if (status === 'HADIR') {
      if (!lat || !lng) {
        return { error: 'Gagal membaca lokasi. Pastikan GPS aktif dan izin lokasi diberikan.' }
      }
      const geo = isWithinRadius(lat, lng)
      if (!geo.valid) {
        return { error: `Terlalu jauh dari posko! Jarak Anda: ${geo.distance.toFixed(2)}km (Maksimal 10km).` }
      }
    }

    await prisma.attendance.create({
      data: {
        sessionId,
        participantId,
        status,
        notes: notes || null
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
