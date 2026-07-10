'use client'

import { useState, useTransition } from 'react'
import { submitAttendance } from '@/app/actions/attendance'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

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
      <div className="text-center p-8 bg-success/10 rounded-md border-2 border-black neo-shadow bg-[#4ade80]">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Berhasil!</h3>
        <p className="font-medium text-lg">{message.text}</p>
        <Button className="mt-8 bg-white text-black hover:bg-gray-100 border-2 border-black" onClick={() => setMessage(null)}>
          Absen Orang Lain
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="text-lg font-bold border-b-2 border-black pb-1 inline-block">Pilih Nama Anda</label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-1 pb-4">
          {participants.map((p) => {
            const isSelected = selectedId === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "cursor-pointer p-3 rounded-md border-2 border-black transition-all text-sm",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-none translate-x-[2px] translate-y-[2px]" 
                    : "bg-white hover:bg-gray-50 neo-shadow hover:neo-shadow-hover"
                )}
              >
                <div className="font-bold line-clamp-1">{p.name}</div>
                <div className="text-xs opacity-80">{p.nim}</div>
              </div>
            )
          })}
        </div>
      </div>
      
      {message?.type === 'error' && (
        <p className="p-3 bg-destructive text-destructive-foreground font-bold border-2 border-black neo-shadow text-sm">{message.text}</p>
      )}

      <Button type="submit" size="lg" className="w-full text-lg h-14 uppercase tracking-wider" disabled={isPending || !selectedId}>
        {isPending ? 'Mengirim...' : 'Konfirmasi Hadir'}
      </Button>
    </form>
  )
}
