import { PrismaClient } from '@prisma/client'
import { subDays, format, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting backfill for the past 30 days...')
  
  const participants = await prisma.participant.findMany()
  if (participants.length === 0) {
    console.log('No participants found. Please add participants first.')
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let currentDate = subDays(today, 30)

  let createdSessionsCount = 0
  let createdAttendancesCount = 0

  while (currentDate < today) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const formattedDate = format(currentDate, 'dd MMMM yyyy')
    
    // Check if a session already exists for this date to avoid duplicates
    const existingSession = await prisma.session.findFirst({
      where: {
        date: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(dateStr + 'T23:59:59.999Z')
        }
      }
    })

    if (!existingSession) {
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
    } else {
      console.log(`Session for ${formattedDate} already exists. Skipping...`)
    }

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
