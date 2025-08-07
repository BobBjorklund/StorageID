// app/api/containers/move-location/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { containerId, locationId } = await req.json()

  try {
    await prisma.container.update({
      where: { id: containerId },
      data: {
        locationId,
        parentId: null,
      },
    })

    return NextResponse.json({ message: 'Container moved to location root' })
  } catch (error) {
    console.error('❌ Move container to location failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
