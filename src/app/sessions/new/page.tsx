'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSession } from '@/app/actions/sessions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi'),
  notes: z.string().optional()
})

type FormData = z.infer<typeof schema>

export default function NewSessionPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = (data: FormData) => {
    setError(null)
    startTransition(async () => {
      const res = await createSession(data)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        router.push(`/sessions/${res.sessionId}`)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/sessions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Buat Sesi Baru</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Judul Kegiatan (misal: Rapat Koordinasi)" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Input placeholder="Lokasi (misal: Balai Desa)" {...register('location')} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input type="time" {...register('startTime')} />
                {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>}
              </div>
              <div>
                <Input type="time" {...register('endTime')} />
                {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>}
              </div>
            </div>
            <div>
              <Input placeholder="Catatan tambahan (opsional)" {...register('notes')} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Sesi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
