'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const participantSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nim: z.string().min(1, 'NIM wajib diisi')
})

export async function addParticipant(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = participantSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Data tidak valid' }
  }

  try {
    await prisma.participant.create({
      data: parsed.data
    })
    revalidatePath('/participants')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { error: 'NIM mungkin sudah terdaftar atau terjadi kesalahan' }
  }
}

export async function deleteParticipant(id: string) {
  try {
    await prisma.participant.delete({ where: { id } })
    revalidatePath('/participants')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { error: 'Gagal menghapus partisipan' }
  }
}
