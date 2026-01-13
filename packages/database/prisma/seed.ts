import { prisma } from "../src"

async function main() {
  // 1. Create a "Super Admin" User (The Owner)
  const owner = await prisma.user.upsert({
    where: { email: 'admin@pvr.com' },
    update: {},
    create: {
      email: 'admin@pvr.com',
      password: 'hashed_password_123', // In real app, hash this!
      name: 'PVR Admin',
      role: 'THEATER_ADMIN',
    },
  })

  console.log('👤 Admin Created:', owner.id)

  // 2. Create the Theater & Screen
  // We use "Nested Writes" to do this in ONE complex query.
  const theater = await prisma.theater.create({
    data: {
      name: 'PVR Koramangala',
      city: 'Bangalore',
      ownerId: owner.id,
      screens: {
        create: [
          {
            number: 1,
            // We will add seats separately to keep this clean
          },
        ],
      },
    },
    include: {
      screens: true, // We need the Screen ID back
    },
  })

  const screen = theater.screens[0]
  console.log('🎬 Theater & Screen Created:', theater.name)

  // 3. Generate the "Seat Grid" (The Heavy Part)
  // Rows A-J, Columns 1-10
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const seatsData = []

  for (const row of rows) {
    for (let col = 1; col <= 10; col++) {
      seatsData.push({
        screenId: screen.id,
        row: row,
        number: col,
        type: row === 'J' ? 'VIP' : 'STANDARD', // Last row is VIP
      })
    }
  }

  // Bulk Insert 100 Seats
  await prisma.seat.createMany({
    data: seatsData,
  })

  console.log(`💺 Created ${seatsData.length} Seats for Screen 1`)

  // 4. Create a Movie
  const movie = await prisma.movie.create({
    data: {
      title: 'Avengers: Secret Wars',
      description: 'The multiverse is collapsing...',
      duration: 180, // 3 hours
    },
  })

  console.log('🍿 Movie Created:', movie.title)

  // 5. Schedule a Show
  // Tonight at 7:00 PM
  const showTime = new Date()
  showTime.setHours(19, 0, 0, 0)

  const show = await prisma.show.create({
    data: {
      movieId: movie.id,
      screenId: screen.id,
      startTime: showTime,
    },
  })

  console.log('📅 Show Scheduled for:', show.startTime)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })