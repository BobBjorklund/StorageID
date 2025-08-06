import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const locationNames = ['RV', 'Condo', 'Condo-Storage', 'Storage', "Bob's Car"]

  const locations = await Promise.all(
    locationNames.map(async name =>
      prisma.location.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )

  // test containers + items
  const rv = locations.find(l => l.name === 'RV')!
  const condo = locations.find(l => l.name === 'Condo')!
  const storage = locations.find(l => l.name === 'Storage')!

  const underbed = await prisma.container.upsert({
    where: { name: 'Underbed Storage' },
    update: {},
    create: {
      name: 'Underbed Storage',
      locationId: rv.id,
    },
  })

  const drawer = await prisma.container.upsert({
    where: { name: 'Kitchen Drawer' },
    update: {},
    create: {
      name: 'Kitchen Drawer',
      locationId: condo.id,
    },
  })

  const bigTote = await prisma.container.upsert({
    where: { name: 'Big Tote A' },
    update: {},
    create: {
      name: 'Big Tote A',
      locationId: storage.id,
    },
  })

  await prisma.item.upsert({
    where: { title: 'Flashlight' },
    update: {},
    create: {
      title: 'Flashlight',
      description: 'LED camping flashlight',
      containerId: underbed.id,
    },
  })

  await prisma.item.upsert({
    where: { title: 'Spatula' },
    update: {},
    create: {
      title: 'Spatula',
      description: 'Metal cooking spatula',
      containerId: drawer.id,
    },
  })

  await prisma.item.upsert({
    where: { title: 'Old Tax Records' },
    update: {},
    create: {
      title: 'Old Tax Records',
      description: '2009–2013 folders',
      containerId: bigTote.id,
    },
  })
}

main()
  .then(() => console.log('🌱 Seed complete'))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
