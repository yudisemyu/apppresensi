'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { getExportData } from '@/app/actions/export'
import { exportToPDF, exportToExcel } from '@/utils/export'
import { Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ExportButton({ sessionId }: { sessionId: string }) {
  const [format, setFormat] = useState<string>('pdf')
  const [isPending, startTransition] = useTransition()
  
  const handleExport = () => {
    startTransition(async () => {
      const res = await getExportData(sessionId)
      if (res.session) {
        if (format === 'pdf') {
          exportToPDF(res.session)
        } else {
          exportToExcel(res.session)
        }
      } else {
        alert(res.error || 'Gagal mengekspor data')
      }
    })
  }

  return (
    <div className="flex gap-2 items-center">
      <Select value={format} onValueChange={(val) => setFormat(val || 'pdf')}>
        <SelectTrigger className="w-[100px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" onClick={handleExport} disabled={isPending}>
        <Download className="mr-2 h-4 w-4" />
        {isPending ? 'Mengekspor...' : 'Ekspor'}
      </Button>
    </div>
  )
}
