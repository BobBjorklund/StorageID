// app/api/items/move-location/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { itemId, locationId } = await req.json()

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        container: {
          connect: {
            id: null, // remove container
          },
        },
        containerId: null, // remove reference to any container
      },
    })

    return NextResponse.json({ message: 'Item moved to location root' })
  } catch (error) {
    console.error('❌ Move item to location failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
