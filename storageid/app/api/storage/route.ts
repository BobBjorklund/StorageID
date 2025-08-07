import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const locations = await prisma.location.findMany({
    include: {
      containers: {
        include: {
          location: true,
          parent: true,
          items: true,
        },
      },
    },
  })

  const allContainers = await prisma.container.findMany({
    select: { id: true, name: true, locationId: true },
  })

  const allLocations = await prisma.location.findMany({
    select: { id: true, name: true },
  })

  return NextResponse.json({
    locations,
    allContainers,
    allLocations,
  })
}
