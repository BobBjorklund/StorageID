// app/api/items/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/db/prisma'

export async function GET() {
  try {
    const containers = await prisma.container.findMany({
      include: {
        items: true,
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
    const locationMap = new Map<string, { id: string; name: string; containers: any[] }>()
    locations.forEach((loc:any) => {
      locationMap.set(loc.id, { ...loc, containers: [] })
    })

    for (const c of containers) {
      if (c.locationId && locationMap.has(c.locationId)) {
        locationMap.get(c.locationId)!.containers.push({ ...c, children: [], parent: null })
      }
    }

    const response = {
      locations: Array.from(locationMap.values()),
      allContainers: containers.map((c:any) => ({
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
