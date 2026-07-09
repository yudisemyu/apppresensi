'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { getAllExportData } from '@/app/actions/export'
import { exportOverallToPDF, exportOverallToExcel } from '@/utils/export'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'

export default function OverallExportButton() {
  const [isPending, startTransition] = useTransition()

  const handleExport = (type: 'pdf' | 'excel') => {
    startTransition(async () => {
      const res = await getAllExportData()
      if (type === 'pdf') {
        exportOverallToPDF(res.sessions, res.participants)
      } else {
        exportOverallToExcel(res.sessions, res.participants)
      }
    })
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={isPending}>
        <FileText className="mr-2 h-4 w-4" />
        Ekspor PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('excel')} disabled={isPending}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Ekspor Excel
      </Button>
    </div>
  )
}
