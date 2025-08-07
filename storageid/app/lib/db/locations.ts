import { prisma } from './prisma'

export async function getAllLocations() {
  return prisma.location.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
