// /app/api/doompile/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/db/prisma'

export async function POST(req: Request) {
  const { locationId, locationName } = await req.json()

  if (!locationId || !locationName) {
    return new NextResponse('Missing location info', { status: 400 })
  }

  const doompileName = `${locationName}_DOOMPILE`

  const existing = await prisma.container.findFirst({
    where: {
      name: doompileName,
      locationId,
      parentId: null,
    },
  })

  if (existing) {
    return NextResponse.json({ id: existing.id }) // ✅ already exists
  }

  const created = await prisma.container.create({
    data: {
      name: doompileName,
      locationId,
      parentId: null,
    },
  })

  return NextResponse.json({ id: created.id })
}
