export type ContainerWithDetails = {
  id: string
  name: string
  locationId: string | null
  parentId: string | null
  location?: {
    id: string
    name: string
  } | null
  items: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    containerId: string | null
  }[]
  parent?: ContainerWithDetails | null
  children?: ContainerWithDetails[]
}
