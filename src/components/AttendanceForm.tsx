'use client'

import { useState, useTransition } from 'react'
import { submitAttendance } from '@/app/actions/attendance'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Participant = {
  id: string
  name: string
  nim: string
}

export default function AttendanceForm({ sessionId, participants }: { sessionId: string, participants: Participant[] }) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      setMessage({ type: 'error', text: 'Pilih nama Anda terlebih dahulu' })
      return
    }

    setMessage(null)
    startTransition(async () => {
      const res = await submitAttendance(sessionId, selectedId)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Absensi berhasil direkam! Terima kasih.' })
        setSelectedId('')
      }
    })
  }

  if (message?.type === 'success') {
    return (
      <div className="text-center p-8 bg-success/10 rounded-lg border border-success/20">
        <h3 className="text-xl font-semibold text-success mb-2">Berhasil!</h3>
        <p className="text-success">{message.text}</p>
        <Button className="mt-6" variant="outline" onClick={() => setMessage(null)}>
          Absen Orang Lain
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Pilih Nama Anda</label>
        <Select value={selectedId} onValueChange={(val) => setSelectedId(val || '')}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Pilih partisipan..." />
          </SelectTrigger>
          <SelectContent>
            {participants.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} - {p.nim}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {message?.type === 'error' && (
        <p className="text-sm text-destructive font-medium">{message.text}</p>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={isPending || !selectedId}>
        {isPending ? 'Mengirim...' : 'Hadir'}
      </Button>
    </form>
  )
}
