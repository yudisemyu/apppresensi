import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, addDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Security check: only allow if secret matches
  if (secret !== 'kkn2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Clearing existing sessions and attendances...')
    
    // Delete all existing data
    await prisma.attendance.deleteMany({})
    await prisma.session.deleteMany({})

    console.log('Starting backfill from 8 July 2026 to 22 August 2026...')
    
    const participants = await prisma.participant.findMany()
    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants found. Please add participants first.' }, { status: 400 })
    }

    // 8 July 2026
    let currentDate = new Date('2026-07-08T00:00:00.000Z')
    // End date is 22 August 2026 inclusive, so loop until < 23 August
    const endDate = new Date('2026-08-23T00:00:00.000Z')

    let createdSessionsCount = 0
    let createdAttendancesCount = 0

    while (currentDate < endDate) {
      const session = await prisma.session.create({
        data: {
          title: `Kegiatan Harian KKN`,
          location: 'Posko KKN',
          date: currentDate,
          startTime: '08:00',
          endTime: '16:00',
          status: 'CLOSED',
          notes: 'Dibuat otomatis (Backfill)'
        }
      })
      createdSessionsCount++

      // Create attendance for all participants
      const attendances = participants.map(p => ({
        participantId: p.id,
        sessionId: session.id,
        status: 'HADIR'
      }))

      await prisma.attendance.createMany({
        data: attendances
      })
      
      createdAttendancesCount += attendances.length

      currentDate = addDays(currentDate, 1)
    }

    return NextResponse.json({
      message: 'Backfill completed successfully!',
      details: {
        createdSessions: createdSessionsCount,
        recordedAttendances: createdAttendancesCount,
        dateRange: '8 July 2026 - 22 August 2026'
      }
    })

  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
