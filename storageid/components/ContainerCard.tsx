// components/ContainerCard.tsx
'use client'
// import { useState } from 'react'
// import { Item } from '@prisma/client'
import ItemRow from './ItemRow'
import { ContainerWithDetails } from '@/app/types'

async function moveToLocation(containerId: string, locationId: string) {
  const res = await fetch('/api/containers/move-location', {
    method: 'POST',
    body: JSON.stringify({ containerId, locationId }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.ok) {
    alert('Container moved to location root!')
  } else {
    alert('Failed to move container.')
  }
}

async function deleteContainer(containerId: string) {
  if (!confirm('Are you sure you want to delete this container and all its items?')) return
  const res = await fetch(`/api/containers/delete`, {
    method: 'POST',
    body: JSON.stringify({ containerId }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.ok) {
    alert('Deleted!')
    location.reload()
  } else {
    alert('Failed to delete container.')
  }
}

export default function ContainerCard({
  container,
  allContainers,
  allLocations,
}: {
  container: ContainerWithDetails
  allContainers: ContainerWithDetails[]|{ id: string; name: string; locationId: string | null }[]
  allLocations: { id: string; name: string }[]
}) {
  const getHierarchy = (c?: ContainerWithDetails | null): string[] => {
    if (!c) return []
    return [...getHierarchy(c.parent), c.name]
  }

  const hierarchy = getHierarchy(container)

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 break-words">{container.name}</h2>
      <p className="text-gray-600 text-sm">
        Location: <span className="font-semibold">{container.location?.name || 'Unknown'}</span>
      </p>

      {hierarchy.length > 1 && (
        <p className="text-sm text-gray-500 mt-2 break-words">
          Path: {hierarchy.join(' → ')}
        </p>
      )}

      {allLocations?.length > 0 && (
        <div className="mt-4 text-sm flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="font-medium shrink-0">Move to Location:</label>
          <select
            value={container.locationId ?? ''}
            onChange={e => moveToLocation(container.id, e.target.value)}
            className="border rounded p-2 w-full sm:w-auto"
          >
            {allLocations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          <button
            onClick={() => deleteContainer(container.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded w-full sm:w-auto"
          >
            Delete Container
          </button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Items:</h3>
        {container.items.length ? (
          <>
              {container.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  containers={allContainers}
                  locations={allLocations}
                />
              ))}
</>
        ) : (
          <p className="text-sm italic text-gray-500">This container is currently empty.</p>
        )}
      </div>

      {container.children && container.children.length > 0 && (
        <div className="mt-4 border-l pl-4 border-gray-300">
          {container.children.map(child => (
            <ContainerCard
              key={child.id}
              container={child}
              allContainers={allContainers}
              allLocations={allLocations}
            />
          ))}
        </div>
      )}
    </div>
  )
}
