// app/api/containers/delete/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  const { containerId } = await req.json()

  try {
    // Delete all child containers recursively (optional enhancement)
    await prisma.container.delete({
      where: { id: containerId },
    })

    return NextResponse.json({ message: 'Container deleted' })
  } catch (error) {
    console.error('❌ Failed to delete container:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
