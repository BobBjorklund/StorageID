import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const locations = ['Condo', 'RV', 'Storage Unit', 'Basement', 'Car']

  for (const name of locations) {
    await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('✅ Seeded initial locations')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })