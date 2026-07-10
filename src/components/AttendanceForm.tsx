'use client'

import { useState, useTransition } from 'react'
import { submitAttendance } from '@/app/actions/attendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CheckCircle2, MapPin } from 'lucide-react'

type Participant = {
  id: string
  name: string
  nim: string
}

export default function AttendanceForm({ sessionId, participants }: { sessionId: string, participants: Participant[] }) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [status, setStatus] = useState<'HADIR' | 'IZIN' | 'SAKIT'>('HADIR')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const [isLocating, setIsLocating] = useState(false)

  const handleNameSelect = (id: string) => {
    setSelectedId(id)
    setStatus('HADIR')
    setNotes('')
    setMessage(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      setMessage({ type: 'error', text: 'Pilih nama Anda terlebih dahulu' })
      return
    }

    if (status !== 'HADIR' && !notes.trim()) {
      setMessage({ type: 'error', text: 'Keterangan wajib diisi jika Izin/Sakit' })
      return
    }

    setMessage(null)

    // Jika hadir, wajib baca GPS
    if (status === 'HADIR') {
      if (!navigator.geolocation) {
        setMessage({ type: 'error', text: 'Browser tidak mendukung GPS' })
        return
      }

      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          executeSubmit(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          setIsLocating(false)
          setMessage({ type: 'error', text: 'Gagal mendapatkan lokasi. Tolong izinkan akses lokasi (GPS).' })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      executeSubmit() // Izin/Sakit tidak butuh GPS
    }
  }

  const executeSubmit = (lat?: number, lng?: number) => {
    startTransition(async () => {
      const res = await submitAttendance(sessionId, selectedId, lat, lng, status, notes)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: `Absensi (${status}) berhasil direkam! Terima kasih.` })
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
        <label className="text-lg font-bold border-b-2 border-black pb-1 inline-block">1. Pilih Nama Anda</label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto p-1 pb-4">
          {participants.map((p) => {
            const isSelected = selectedId === p.id
            return (
              <div
                key={p.id}
                onClick={() => handleNameSelect(p.id)}
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
      
      {selectedId && (
        <div className="space-y-4 border-2 border-black p-4 rounded-md bg-secondary/20">
          <label className="text-lg font-bold border-b-2 border-black pb-1 inline-block">2. Status Kehadiran</label>
          <div className="grid grid-cols-3 gap-2">
            {(['HADIR', 'IZIN', 'SAKIT'] as const).map((s) => (
              <div
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "cursor-pointer p-2 text-center rounded-md border-2 border-black font-bold text-sm transition-all",
                  status === s 
                    ? (s === 'HADIR' ? 'bg-primary text-white shadow-none translate-y-1' : s === 'IZIN' ? 'bg-yellow-400 shadow-none translate-y-1' : 'bg-red-400 shadow-none translate-y-1')
                    : "bg-white neo-shadow hover:neo-shadow-hover"
                )}
              >
                {s}
              </div>
            ))}
          </div>

          {status !== 'HADIR' && (
            <div className="space-y-2 mt-4">
              <label className="text-sm font-bold">Keterangan / Alasan</label>
              <Input 
                placeholder={`Alasan ${status.toLowerCase()}...`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {status === 'HADIR' && (
             <div className="text-xs text-muted-foreground mt-2 flex items-center">
               <MapPin className="w-3 h-3 mr-1 inline" /> Validasi GPS 10km akan dilakukan
             </div>
          )}
        </div>
      )}
      
      {message?.type === 'error' && (
        <p className="p-3 bg-destructive text-destructive-foreground font-bold border-2 border-black neo-shadow text-sm">{message.text}</p>
      )}

      <Button type="submit" size="lg" className="w-full text-lg h-14 uppercase tracking-wider" disabled={isPending || isLocating || !selectedId}>
        {isLocating ? 'Membaca GPS...' : isPending ? 'Mengirim...' : 'Konfirmasi Hadir'}
      </Button>
    </form>
  )
}
