// components/ContainerCard.tsx
'use client'

import { useState } from 'react'
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
}: {
  container: ContainerWithDetails
  allContainers: ContainerWithDetails[] | { id: string; name: string; locationId: string | null }[]
  allLocations: { id: string; name: string }[]
}) {
  const [moveTab, setMoveTab] = useState<'location' | 'container'>('location')

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

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-1 sm:p-1 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words">
            {container.name}
          </h2>
          <div className="mt-0.5 h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
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

        {/* Delete (kept simple, compact) */}
        <button
          onClick={() => deleteContainer(container.id)}
          className="shrink-0 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      {/* Controls / Content */}
      <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* LEFT SIDE: stacked cards, minimal negative space */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:auto-rows-min">
          {/* Row 1: Move (col 1) */}
          <section className="rounded-lg border border-gray-200 bg-white/90 p-1 hover:border-indigo-200 transition-colors">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Move
              </h3>
              <div className="ml-auto inline-flex overflow-hidden rounded border border-gray-300">
                <button
                  type="button"
                  aria-pressed={moveTab === 'location'}
                  onClick={() => setMoveTab('location')}
                  className={`px-2 py-0.5 text-[11px] ${
                    moveTab === 'location'
                      ? 'bg-gray-200 font-medium'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Location
                </button>
                <button
                  type="button"
                  aria-pressed={moveTab === 'container'}
                  onClick={() => setMoveTab('container')}
                  className={`px-2 py-0.5 text-[11px] border-l border-gray-300 ${
                    moveTab === 'container'
                      ? 'bg-gray-200 font-medium'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Container
                </button>
              </div>
            </div>

            {/* LOCATION TAB — same behavior: change => move */}
            <div className={moveTab === 'location' ? 'block' : 'hidden'}>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                Select location
              </label>
              <select
                value={container.locationId ?? ''}
                onChange={(e) => moveToLocation(container.id, e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-gray-500">Applies immediately.</p>
            </div>

            {/* CONTAINER TAB — same behavior: change => move */}
            <div className={moveTab === 'container' ? 'block' : 'hidden'}>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                Select container
              </label>
              <select
                defaultValue="" // blank means move to root
                onChange={(e) => moveIntoContainer(container.id, e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">— Location Root —</option>
                {moveTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-gray-500">Applies immediately.</p>
            </div>
          </section>

          {/* Row 1: Actions (col 2) */}
          <section className="rounded-lg border border-gray-200 bg-white/90 p-1">
            <h3 className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Actions
            </h3>
            <p className="text-[11px] text-gray-500">Manage items below.</p>
            <button
              onClick={() => deleteContainer(container.id)}
              className="mt-1 w-full rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              Delete Container
            </button>
          </section>

          {/* Row 2: Summary / Meta (spans both) — optional light info */}
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-1 md:col-span-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-700">
              <span className="font-medium">Items:</span>
              <span className="rounded border bg-white px-1.5 py-0.5">
                {container.items.length}
              </span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">Children:</span>
              <span className="rounded border bg-white px-1.5 py-0.5">
                {container.children?.length ?? 0}
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE: visual card for quick scan (no functionality change) */}
        <div className="rounded-lg border border-gray-200 bg-white/70 p-1">
          <h3 className="mb-1 text-[11px] font-semibold text-gray-700">Overview</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
            <div className="rounded border bg-gray-50 p-1">
              <div className="text-gray-500">Location</div>
              <div className="font-medium">{container.location?.name || 'Unknown'}</div>
            </div>
            <div className="rounded border bg-gray-50 p-1">
              <div className="text-gray-500">Depth</div>
              <div className="font-medium">
                {Math.max(1, hierarchy.length)}
              </div>
            </div>
            <div className="rounded border bg-gray-50 p-1 col-span-2">
              <div className="text-gray-500 mb-0.5">Path</div>
              <div className="truncate">{hierarchy.join(' / ')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-1.5">Items</h3>
        {container.items.length ? (
          <div className="space-y-2">
            {container.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                containers={normalized}
                locations={allLocations}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-500">
            This container is currently empty.
          </p>
        )}
      </div>

      {/* Children */}
      {container.children && container.children.length > 0 && (
        <div className="mt-1 border-l pl-1 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Subcontainers</h3>
          <div className="space-y-2">
            {container.children.map((child) => (
              <ContainerCard
                key={child.id}
                container={child}
                allContainers={allContainers}
                allLocations={allLocations}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
