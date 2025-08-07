import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { itemId } = await req.json()

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        containerId: null, // ✅ This is enough to remove the link
      },
    })

    return NextResponse.json({ message: 'Item moved to location root' })
  } catch (error) {
    console.error('❌ Move item to location failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

