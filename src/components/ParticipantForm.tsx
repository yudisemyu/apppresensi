'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addParticipant } from '@/app/actions/participants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nim: z.string().min(1, 'NIM wajib diisi')
})

type FormData = z.infer<typeof schema>

export default function ParticipantForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = (data: FormData) => {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('nim', data.nim)
      const res = await addParticipant(formData)
      if (res.error) {
        setError(res.error)
      } else {
        reset()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Partisipan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input placeholder="Nama Lengkap" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="NIM" {...register('nim')} />
            {errors.nim && <p className="text-sm text-destructive mt-1">{errors.nim.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menambahkan...' : 'Tambah Partisipan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
