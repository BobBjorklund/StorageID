// app/api/items/route.ts
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
            quantity: true, // ensure quantity is included
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
    const locationMap = new Map<
      string,
      { id: string; name: string; containers: ContainerWithDetails[] }
    >()
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

    return NextResponse.json(response)
  } catch (err) {
    console.error('❌ Failed to fetch data:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST: Create a new item (now accepts quantity)
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<{
      title: string
      description: string | null
      imageUrl: string | null
      containerId: string
      quantity: number | string
    }>

    const title = (body.title ?? '').trim()
    const containerId = body.containerId ?? ''

    if (!title || !containerId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Coerce quantity: default 1, non-negative integer
    const qRaw = body.quantity
    let quantity = 1
    if (typeof qRaw === 'number') {
      quantity = Math.max(0, Math.floor(qRaw))
    } else if (typeof qRaw === 'string') {
      const n = Number.parseInt(qRaw, 10)
      quantity = Number.isNaN(n) ? 1 : Math.max(0, n)
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
        quantity,
        container: {
          connect: { id: containerId },
          // If you allow moving to a DOOMPILE or similar, this still connects by id.
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        quantity: true,
        containerId: true,
      },
    })

    return NextResponse.json(newItem)
  } catch (err) {
    console.error('❌ Failed to create item:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
