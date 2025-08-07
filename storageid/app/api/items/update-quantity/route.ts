import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { itemId, quantity } = await req.json()
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { quantity },
    })
    return NextResponse.json({ message: 'Quantity updated' })
  } catch (err) {
    console.error('❌ Failed to update quantity:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
