// app/api/locations/route.ts
import { NextResponse } from 'next/server'
import { getAllLocations } from '../../lib/db/locations'
import { prisma } from '../../lib/db/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const locations = await getAllLocations()
    console.log('✅ Fetched locations:', locations)
    return NextResponse.json(locations)
  } catch (error) {
    console.error('❌ Failed to fetch locations:', error)
    return new NextResponse('Error fetching locations', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<{ name: string }>
    const name = (body.name ?? '').trim()
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const created = await prisma.location.create({
      data: { name },
      select: { id: true, name: true },
    })
    console.log('✅ Created location:', created)
    return NextResponse.json(created, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Unique constraint violation (if there's a unique index on Location.name)
      return new NextResponse('Location already exists', { status: 409 })
    }
    console.error('❌ Failed to create location:', error)
    return new NextResponse('Error creating location', { status: 500 })
  }
}
