// app/api/containers/move-location/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma' // or '@/lib/db/prisma'

export async function POST(req: Request) {
  try {
    const { containerId, locationId } = await req.json() as {
      containerId?: string
      locationId?: string
    }

    if (!containerId || !locationId) {
      return NextResponse.json(
        { error: 'Missing containerId or locationId' },
        { status: 400 }
      )
    }

    // Get the location (for naming a new DOOMPILE if needed)
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, name: true },
    })
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Find existing DOOMPILE in this location (case-insensitive, partial match)
    let doompile = await prisma.container.findFirst({
      where: {
        locationId: locationId,
        name: { contains: 'DOOMPILE', mode: 'insensitive' },
      },
      select: { id: true, name: true },
    })

    // If none, create one
    if (!doompile) {
      doompile = await prisma.container.create({
        data: {
          name: `${location.name}_DOOMPILE`,
          locationId: locationId,
          parentId: null, // make it a root container at that location
        },
        select: { id: true, name: true },
      })
    }

    // Move the container to the new location and under DOOMPILE
    await prisma.container.update({
      where: { id: containerId },
      data: {
        locationId,
        parentId: doompile.id,
      },
    })

    return NextResponse.json({
      ok: true,
      message: `Container moved under ${doompile.name}`,
      doompileId: doompile.id,
      containerId,
      locationId,
    })
  } catch (error) {
    console.error('❌ Move container to location failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
