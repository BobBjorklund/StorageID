// components/ContainerCard.tsx
'use client'

import { useState, useMemo } from 'react'
import ItemRow from './ItemRow'
import { ContainerWithDetails } from '@/app/types'

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
  depth = 0,
}: {
  container: ContainerWithDetails
  allContainers: ContainerWithDetails[] | { id: string; name: string; locationId: string | null }[]
  allLocations: { id: string; name: string }[]
  depth?: number
}) {
  const [moveTab, setMoveTab] = useState<'location' | 'container'>('location')

  // Check if this container or any descendant has items
  const hasItemsRecursive = useMemo(() => {
    const checkForItems = (c: ContainerWithDetails): boolean => {
      if (c.items && c.items.length > 0) return true
      if (c.children) {
        return c.children.some(child => checkForItems(child))
      }
      return false
    }
    return checkForItems(container)
  }, [container])

  // Start expanded if has items, collapsed otherwise
  const [isExpanded, setIsExpanded] = useState(hasItemsRecursive)

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
      collectDescendants(child, set)
    }
  }
  const descendantIds = new Set<string>()
  collectDescendants(container, descendantIds)

  // Normalize allContainers to a minimal shape
  const normalized = (allContainers as ContainerWithDetails[]).map((c) => ({
    id: c.id,
    name: c.name,
    locationId: c.locationId ?? null,
  }))

  // Eligible targets: same location, not self, not descendant
  const moveTargets = normalized
    .filter(
      (c) =>
        c.locationId === container.locationId &&
        c.id !== container.id &&
        !descendantIds.has(c.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  // Calculate visual depth indentation
  const indentLevel = Math.min(depth, 6) // Cap at 6 levels for visual clarity
  const indentClass = 'ml-1'
    {/* ${indentLevel * 1}` */}

  return (
    <div 
      className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 mb-1 ${indentClass}`}
       // Fallback for deeper nesting
    >
      {/* Collapsible Header */}
      <div 
        className='flex items-center justify-between p-1 cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {/* Expand/Collapse Icon */}
          <button
            type="button"
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            <span className={`inline-block transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : 'rotate-90'
            }`}>
              ▶
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                {container.name}
              </h2>
              
              {/* Item count badge */}
              <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                hasItemsRecursive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {container.items.length} items
              </span>
              
              {/* Children count if any */}
              {container.children && container.children.length > 0 && (
                <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {container.children.length} containers
                </span>
              )}
            </div>

            <div className="mt-1.5 h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
            
            <p className="mt-1 text-xs text-gray-600">
              Location:{' '}
              <span className="font-semibold">
                {container.location?.name || 'Unknown'}
              </span>
            </p>

            {hierarchy.length > 1 && (
              <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-gray-500">
                {hierarchy.map((seg, i) => (
                  <span key={`${seg}-${i}`} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-gray-300">/</span>}
                    <span className="rounded bg-gray-50 px-1.5 py-0.5 border border-gray-200">
                      {seg}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteContainer(container.id)
          }}
          className="shrink-0 rounded-md bg-red-600 px-1.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-1 pb-1">
          {/* Controls / Content */}
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {/* LEFT SIDE: stacked cards */}
            <div className="space-y-1">
              {/* Move Section */}
              <section className="rounded-lg border border-gray-200 bg-white/90 p-1 hover:border-indigo-200 transition-colors">
                <div className="mb-2 flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                    Move Container
                  </h3>
                  <div className="ml-auto inline-flex overflow-hidden rounded border border-gray-300">
                    <button
                      type="button"
                      aria-pressed={moveTab === 'location'}
                      onClick={() => setMoveTab('location')}
                      className={`px-1 py-1 text-xs ${
                        moveTab === 'location'
                          ? 'bg-gray-200 font-medium text-gray-800'
                          : 'bg-white hover:bg-gray-50 text-gray-600'
                      } transition-colors`}
                    >
                      Location
                    </button>
                    <button
                      type="button"
                      aria-pressed={moveTab === 'container'}
                      onClick={() => setMoveTab('container')}
                      className={`px-1 py-1 text-xs border-l border-gray-300 ${
                        moveTab === 'container'
                          ? 'bg-gray-200 font-medium text-gray-800'
                          : 'bg-white hover:bg-gray-50 text-gray-600'
                      } transition-colors`}
                    >
                      Container
                    </button>
                  </div>
                </div>

                {/* LOCATION TAB */}
                <div className={moveTab === 'location' ? 'block' : 'hidden'}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Select location
                  </label>
                  <select
                    value={container.locationId ?? ''}
                    onChange={(e) => moveToLocation(container.id, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-1 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    {allLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Changes apply immediately.</p>
                </div>

                {/* CONTAINER TAB */}
                <div className={moveTab === 'container' ? 'block' : 'hidden'}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select parent container
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => moveIntoContainer(container.id, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-1 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">— Location Root —</option>
                    {moveTargets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Changes apply immediately.</p>
                </div>
              </section>

              {/* Summary Section */}
              <section className="rounded-lg border border-gray-200 bg-gray-50 p-1">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Summary</h3>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">{container.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Children:</span>
                    <span className="font-medium text-gray-900">{container.children?.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between col-span-2">
                    <span className="text-gray-600">Depth:</span>
                    <span className="font-medium text-gray-900">{depth + 1}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SIDE: Overview */}
            <div className="rounded-lg border border-gray-200 bg-white/70 p-1">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Container Details</h3>
              <div className="space-y-1">
                <div className="rounded-md border bg-gray-50 p-1">
                  <div className="text-xs text-gray-500 mb-1">Current Location</div>
                  <div className="font-medium text-gray-900">{container.location?.name || 'Unknown'}</div>
                </div>
                <div className="rounded-md border bg-gray-50 p-1">
                  <div className="text-xs text-gray-500 mb-1">Full Path</div>
                  <div className="text-sm text-gray-900 break-all">{hierarchy.join(' → ')}</div>
                </div>
                <div className="rounded-md border bg-gray-50 p-1">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className={`inline-flex items-center px-1 py-1 rounded-full text-xs font-medium ${
                    hasItemsRecursive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {hasItemsRecursive ? 'Contains Items' : 'Empty'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          {container.items.length > 0 && (
            <div className="mt-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Items ({container.items.length})
              </h3>
              <div className="space-y-1">
                {container.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    containers={normalized}
                    locations={allLocations}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Children Section */}
          {container.children && container.children.length > 0 && (
            <div className="mt-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                Subcontainers ({container.children.length})
              </h3>
              <div className="space-y-1">
                {container.children.map((child) => (
                  <ContainerCard
                    key={child.id}
                    container={child}
                    allContainers={allContainers}
                    allLocations={allLocations}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}