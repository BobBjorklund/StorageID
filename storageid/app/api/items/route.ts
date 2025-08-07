import { NextResponse } from 'next/server'
import { prisma } from '../../lib/db/prisma'
import { ContainerWithDetails } from '@/app/types'

// GET: Fetch all data for UI
export async function GET() {
  try {
    const containers = await prisma.container.findMany({
  include: {
    items: {
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        containerId: true,
        quantity: true, // <-- THIS LINE IS THE FIX
      },
    },
    location: true,
  },
})

    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    // Group containers under their location
    const locationMap = new Map<string, { id: string; name: string; containers: ContainerWithDetails[] }>()
    locations.forEach((loc: { id: string; name: string }) => {
      locationMap.set(loc.id, { ...loc, containers: [] })
    })

    for (const c of containers) {
      if (c.locationId && locationMap.has(c.locationId)) {
        locationMap.get(c.locationId)!.containers.push({ ...c, children: [], parent: null })
      }
    }

    const response = {
      locations: Array.from(locationMap.values()),
      allContainers: containers.map((c: ContainerWithDetails) => ({
        id: c.id,
        name: c.name,
        locationId: c.locationId,
      })),
      allLocations: locations,
    }

    console.log('✅ Response composed')
    return NextResponse.json(response)
  } catch (err) {
    console.error('❌ Failed to fetch data:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST: Create a new item
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, imageUrl, containerId } = body

    if (!title || !containerId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        imageUrl,
        container: {
          connect: { id: containerId },
        },
      },
    })

    return NextResponse.json(newItem)
  } catch (err) {
    console.error('❌ Failed to create item:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
