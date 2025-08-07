import { prisma } from './prisma'

interface CreateContainerParams {
  name: string
  parentId?: string | null
  locationId?: string | null
}

export async function createContainer({
  name,
  parentId = null,
  locationId = null,
}: CreateContainerParams) {
  return prisma.container.create({
    data: {
      name,
      parentId,
      locationId,
    },
  })
}
