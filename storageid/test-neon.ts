// test-neon.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Connecting to DB:', process.env.DATABASE_URL)
  const items = await prisma.item.findMany()
  console.log('✅ Items:', items)
}

main()
  .catch(err => {
    console.error('❌ Error connecting to DB:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
