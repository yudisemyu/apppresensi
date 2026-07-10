'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const participantSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nim: z.string().min(1, 'NIM wajib diisi')
})

export async function addParticipant(data: z.infer<typeof participantSchema>) {
  const parsed = participantSchema.safeParse(data)
  
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const messages = Object.values(fieldErrors).flat().join(', ')
    return { error: messages || 'Data tidak valid' }
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
