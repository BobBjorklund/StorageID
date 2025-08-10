'use client'

import { useEffect, useMemo, useState } from 'react'
import ContainerCard from '../components/ContainerCard'
import ItemForm from '../components/ItemForm'
import ContainerForm from '../components/ContainerForm'
import { ContainerWithDetails } from './types'

function buildContainerTree(containers: ContainerWithDetails[]): ContainerWithDetails[] {
  const containerMap = new Map<string, ContainerWithDetails>()
  const roots: ContainerWithDetails[] = []

  containers.forEach((container) => {
    container.children = []
    containerMap.set(container.id, container)
  })

  containers.forEach((container) => {
    if (container.parentId) {
      const parent = containerMap.get(container.parentId)
      parent?.children?.push(container)
    } else {
      roots.push(container)
    }
  })

  return roots
}

type StoragePayload = {
  locations: {
    id: string
    name: string
    containers: ContainerWithDetails[]
  }[]
  allContainers: { id: string; name: string; locationId: string | null }[]
  allLocations: { id: string; name: string }[]
}

export default function HomePage() {
  const [data, setData] = useState<StoragePayload | null>(null)
  const [openByLocation, setOpenByLocation] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    fetch('/api/storage')
      .then((res) => res.json())
      .then((payload: StoragePayload) => {
        if (!mounted) return
        setData(payload)
        const init: Record<string, boolean> = {}
        payload.locations.forEach((loc) => {
          const itemCount = loc.containers.reduce((sum, c) => sum + c.items.length, 0)
          init[loc.id] = itemCount > 0
        })
        setOpenByLocation(init)
      })
      .catch(() => {
        if (!mounted) return
        // Ensure we don't get stuck in "loading" forever on error
        setData({ locations: [], allContainers: [], allLocations: [] })
      })
    return () => {
      mounted = false
    }
  }, [])

  const isLoading = data === null

  // Call hooks before any early returns to keep hook order stable.
  const totals = useMemo(() => {
    if (!data) return { totalItems: 0, totalContainers: 0 }
    let totalItems = 0
    let totalContainers = 0
    data.locations.forEach((loc) => {
      totalContainers += loc.containers.length
      totalItems += loc.containers.reduce((sum, c) => sum + c.items.length, 0)
    })
    return { totalItems, totalContainers }
  }, [data])

  if (isLoading) {
    return (
      <main className="mx-auto w-full px-2 sm:px-1 lg:px-3 max-w-screen-3xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-1">
          <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
          <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="h-20 rounded bg-gray-100 animate-pulse" />
            <div className="h-20 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="mt-1 space-y-1">
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
            <div className="h-6 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  // At this point, data is a concrete object (possibly empty if fetch failed)
  const { locations, allContainers, allLocations } = data!

  return (
    <main className="mx-auto w-full px-2 sm:px-1 lg:px-3 max-w-screen-3xl">
      <header className="mb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">All Storage Locations</h1>
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
            {totals.totalContainers} containers
          </span>
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
            {totals.totalItems} items
          </span>
        </div>
        <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
      </header>

      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 mb-1">
        <details className="group rounded-xl border border-gray-200 bg-white shadow-sm p-1">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">+ Add New Item</span>
            <span className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180">▶</span>
          </summary>
          <div className="mt-1">
            <ItemForm containers={allContainers} />
          </div>
        </details>

        <details className="group rounded-xl border border-gray-200 bg-white shadow-sm p-1">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">+ Add New Container</span>
            <span className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180">▶</span>
          </summary>
          <div className="mt-1">
            <ContainerForm containers={allContainers} locations={allLocations} />
          </div>
        </details>
      </div>

      <section className="space-y-1">
        {locations.map((location) => {
          const tree = buildContainerTree(location.containers)
          const itemCount = location.containers.reduce((sum, c) => sum + c.items.length, 0)
          const containerCount = location.containers.length
          const isOpen = !!openByLocation[location.id]

          return (
            <div
              key={location.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                className="flex items-center justify-between p-1 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setOpenByLocation((prev) => ({ ...prev, [location.id]: !prev[location.id] }))
                }
                role="button"
                aria-expanded={isOpen}
                aria-controls={`loc-body-${location.id}`}
              >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <button
                    type="button"
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenByLocation((prev) => ({
                        ...prev,
                        [location.id]: !prev[location.id],
                      }))
                    }}
                    aria-label={isOpen ? 'Collapse location' : 'Expand location'}
                  >
                    <span
                      className={`inline-block transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'rotate-90'
                      }`}
                    >
                      ▶
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                        {location.name}
                      </h2>
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                        {containerCount} containers
                      </span>
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                        {itemCount} items
                      </span>
                    </div>
                    <div className="mt-1 h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
                  </div>
                </div>
              </div>

              <div
                id={`loc-body-${location.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-1 pb-1">
                  {tree.length > 0 ? (
                    <div className="space-y-1">
                      {tree.map((container) => (
                        <ContainerCard
                          key={container.id}
                          container={container}
                          allContainers={allContainers}
                          allLocations={allLocations}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      No containers yet for this location.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
