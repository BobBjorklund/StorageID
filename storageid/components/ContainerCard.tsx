// components/ContainerCard.tsx
'use client'
import ItemRow from './ItemRow'
import { ContainerWithDetails } from '@/app/types'

async function moveToLocation(containerId: string, locationId: string) {
  const res = await fetch('/api/containers/move-location', {
    method: 'POST',
    body: JSON.stringify({ containerId, locationId }),
    headers: { 'Content-Type': 'application/json' },
  })
  alert(res.ok ? 'Container moved to location root!' : 'Failed to move container.')
}

async function moveIntoContainer(containerId: string, targetContainerId: string | '') {
  const res = await fetch('/api/containers/move-parent', {
    method: 'POST',
    body: JSON.stringify({
      containerId,
      targetContainerId: targetContainerId || null, // empty => root
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.ok) {
    alert('Container moved!')
    // optional: location.reload()
  } else {
    const t = await res.text().catch(() => '')
    alert(`Failed to move container.${t ? `\n${t}` : ''}`)
  }
}

export default function ContainerCard({
  container,
  allContainers,
  allLocations,
}: {
  container: ContainerWithDetails
  allContainers: ContainerWithDetails[] | { id: string; name: string; locationId: string | null }[]
  allLocations: { id: string; name: string }[]
}) {
  const getHierarchy = (c?: ContainerWithDetails | null): string[] => {
    if (!c) return []
    return [...getHierarchy(c.parent), c.name]
  }

  const hierarchy = getHierarchy(container)

  // Build a set of descendant ids to avoid moving into a descendant
  const collectDescendants = (c: ContainerWithDetails | undefined | null, set: Set<string>) => {
    if (!c?.children) return
    for (const child of c.children) {
      set.add(child.id)
      collectDescendants(child as any, set)
    }
  }
  const descendantIds = new Set<string>()
  collectDescendants(container, descendantIds)

  // Normalize allContainers to a minimal shape
  const normalized = (allContainers as any[]).map(c => ({
    id: c.id,
    name: c.name,
    locationId: c.locationId ?? null,
  }))

  // Eligible targets: same location, not self, not descendant
  const moveTargets = normalized
    .filter(c =>
      c.locationId === container.locationId &&
      c.id !== container.id &&
      !descendantIds.has(c.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name))

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

      {/* Controls */}
      <div className="mt-4 text-sm flex flex-col gap-3">
        {/* Move to Location */}
        {allLocations?.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
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
          </div>
        )}

        {/* Move into Container */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="font-medium shrink-0">Move into Container:</label>
          <select
            defaultValue="" // blank means move to root
            onChange={e => moveIntoContainer(container.id, e.target.value)}
            className="border rounded p-2 w-full sm:w-auto"
          >
            <option value="">— Location Root —</option>
            {moveTargets.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => deleteContainer(container.id)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded w-full sm:w-auto"
          >
            Delete Container
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 overflow-x-auto">
        <h3 className="text-md font-semibold text-gray-700 mb-2">Items:</h3>
        {container.items.length ? (
          <>
            {container.items.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                containers={normalized}
                locations={allLocations}
              />
            ))}
          </>
        ) : (
          <p className="text-sm italic text-gray-500">This container is currently empty.</p>
        )}
      </div>

      {/* Children */}
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
