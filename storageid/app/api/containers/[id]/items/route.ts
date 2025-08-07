import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const items = await prisma.item.findMany({
      where: { containerId: params.id },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('❌ Failed to fetch items for container:', error)
    return new NextResponse('Error fetching items', { status: 500 })
  }
}
