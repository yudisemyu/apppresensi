import { PrismaClient } from '@prisma/client'
import { format, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing sessions and attendances...')
  
  // Delete all existing data
  await prisma.attendance.deleteMany({})
  await prisma.session.deleteMany({})

  console.log('Starting backfill from 8 July 2026 to 22 August 2026...')
  
  const participants = await prisma.participant.findMany()
  if (participants.length === 0) {
    console.log('No participants found. Please add participants first.')
    return
  }

  // 8 July 2026
  let currentDate = new Date('2026-07-08T00:00:00.000Z')
  // End date is 22 August 2026 inclusive, so loop until < 23 August
  const endDate = new Date('2026-08-23T00:00:00.000Z')

  let createdSessionsCount = 0
  let createdAttendancesCount = 0

  while (currentDate < endDate) {
    const formattedDate = format(currentDate, 'dd MMMM yyyy')
    
    console.log(`Creating session for ${formattedDate}...`)
    
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

  console.log('=============================================')
  console.log('Backfill completed successfully!')
  console.log(`Created ${createdSessionsCount} sessions.`)
  console.log(`Recorded ${createdAttendancesCount} attendances.`)
  console.log('=============================================')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
