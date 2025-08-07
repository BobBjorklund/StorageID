// app/api/containers/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, parentId, locationId } = body

    const newContainer = await prisma.container.create({
      data: {
        name,
        parentId: parentId || null,
        locationId: locationId || null,
      },
    })

    return NextResponse.json(newContainer)
  } catch (error) {
    console.error('Error creating container:', error)
    return NextResponse.json({ error: 'Failed to create container' }, { status: 500 })
  }
}
