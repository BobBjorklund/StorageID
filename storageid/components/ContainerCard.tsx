import { ContainerWithDetails } from '../app/page'
import ItemRow from './ItemRow'

export default function ContainerCard({ container, allContainers }: {
  container: ContainerWithDetails
  allContainers: { id: string; name: string }[]
}) {
  const getHierarchy = (c?: ContainerWithDetails | null): string[] => {
    if (!c) return []
    return [...getHierarchy(c.parent), c.name]
  }

  const hierarchy = getHierarchy(container.parent)
  const hasItems = container.items.length > 0
  const hasChildren = container.children && container.children.length > 0

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-lg font-bold text-gray-800">{container.name}</h3>

      {hierarchy.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">
          Path: {hierarchy.join(' → ')} → <span className="font-semibold">{container.name}</span>
        </p>
      )}

      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-2">Items:</h4>
        {hasItems ? (
          <table className="w-full text-left text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Move</th>
              </tr>
            </thead>
            <tbody>
              {container.items.map(item => (
                <ItemRow key={item.id} item={item} containers={allContainers} />
              ))}
            </tbody>
          </table>
        ) : hasChildren ? (
          <p className="text-sm text-gray-500 italic">This container has no direct items, but holds other containers.</p>
        ) : (
          <p className="text-sm text-gray-500 italic">This container is currently empty.</p>
        )}
      </div>

      {hasChildren && (
        <div className="ml-6 mt-4 border-l pl-4 border-gray-300">
          {container.children!.map(child => (
            <ContainerCard key={child.id} container={child} allContainers={allContainers} />
          ))}
        </div>
      )}
    </div>
  )
}
