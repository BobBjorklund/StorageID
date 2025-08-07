// app/api/items/delete/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { itemId } = await req.json()

  try {
    await prisma.item.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ message: 'Item deleted' })
  } catch (error) {
    console.error('❌ Failed to delete item:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
