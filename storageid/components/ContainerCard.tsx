'use client'

import { Item } from '@prisma/client'
import ItemRow from './ItemRow'

export type ContainerWithDetails = {
  id: string
  name: string
  locationId: string | null
  parentId: string | null
  location?: {
    id: string
    name: string
  } | null
  items: Item[]
  parent?: ContainerWithDetails | null
  children?: ContainerWithDetails[]
}

export default function ContainerCard({ container, allContainers }: { container: ContainerWithDetails, allContainers: ContainerWithDetails[] }) {
  const getHierarchy = (c?: ContainerWithDetails | null): string[] => {
    if (!c) return []
    return [...getHierarchy(c.parent), c.name]
  }

  const hierarchy = getHierarchy(container)
  const thisContainerPath = allContainers
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800">{container.name}</h2>

      <p className="text-gray-600 text-sm">
        Location: <span className="font-semibold">{container.location?.name || 'Unknown'}</span>
      </p>

      {hierarchy.length > 1 && (
        <p className="text-sm text-gray-500 mt-2">
          Path: {hierarchy.join(' → ')}
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Items:</h3>
        {container.items.length > 0 ? (
          <table className="w-full text-left text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Description</th>
              </tr>
            </thead>
            <tbody>
              {container.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  containers={thisContainerPath} // for display purposes
                />
                
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500 italic">This container is currently empty.</p>
        )}
      </div>

      {container.children && container.children.length > 0 && (
        <div className="ml-6 mt-4 border-l pl-4 border-gray-300">
          {container.children.map(child => (
            <ContainerCard key={child.id} container={child} allContainers={allContainers} />
          ))}
        </div>
      )}
    </div>
  )
}
