import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { title, description, imageUrl, containerId } = await req.json()

  if (!title || !containerId) {
    return new Response('Missing required fields', { status: 400 })
  }

  const item = await prisma.item.create({
    data: {
      title,
      description,
      imageUrl,
      containerId,
    },
  })

  return Response.json(item)
}
