'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function QRCodeCard({ sessionId, status }: { sessionId: string, status: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/attend/${sessionId}`)
  }, [sessionId])

  if (status !== 'OPEN') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QR Code Absensi</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8 border-t">
          Sesi saat ini ditutup. Buka sesi untuk menampilkan QR Code.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Absensi</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-8 border-t">
        {url ? (
          <>
            <div className="bg-white p-4 rounded-xl border">
              <QRCodeSVG value={url} size={200} />
            </div>
            <p className="text-sm text-muted-foreground">Atau kunjungi tautan:</p>
            <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all text-center">
              {url}
            </a>
          </>
        ) : (
          <div>Memuat...</div>
        )}
      </CardContent>
    </Card>
  )
}
