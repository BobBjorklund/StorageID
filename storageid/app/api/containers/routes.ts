import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { name, locationId, parentId } = await req.json()

  if (!name || !locationId) {
    return new Response('Missing required fields', { status: 400 })
  }

  const container = await prisma.container.create({
    data: {
      name,
      locationId,
      parentId,
    },
  })

  return Response.json(container)
}