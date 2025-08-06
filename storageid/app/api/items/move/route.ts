
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { itemId, containerId } = await req.json()

  if (!itemId || !containerId) {
    return new Response('Missing required fields', { status: 400 })
  }

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: { containerId },
  })

  return Response.json(updated)
}

