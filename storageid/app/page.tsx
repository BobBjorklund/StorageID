'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetch('/api/storage')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return (
<main className="mx-auto w-full px-3 sm:px-2 lg:px-6 max-w-screen-2xl">
        {/* skeleton card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-1 sm:p-1">
          <div className="h-5 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="h-24 rounded bg-gray-100 animate-pulse" />
            <div className="h-24 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-24 rounded bg-gray-100 animate-pulse" />
            <div className="h-24 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  const { locations, allContainers, allLocations } = data

  return (
<main className="mx-auto w-full px-2 sm:px-1 lg:px-3 max-w-screen-3xl">
      {/* Page header */}
      <header className="mb-1 sm:mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          All Storage Locations
        </h1>
        <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
      </header>

      {/* Quick add cards */}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 mb-1 sm:mb-1">
        {/* Add Item */}
        <details className="group rounded-xl border border-gray-200 bg-white shadow-sm p-1 sm:p-1">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              + Add New Item
            </span>
            <svg
              className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-1">
            <ItemForm containers={allContainers} />
          </div>
        </details>

        {/* Add Container */}
        <details className="group rounded-xl border border-gray-200 bg-white shadow-sm p-1 sm:p-1">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              + Add New Container
            </span>
            <svg
              className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-1">
            <ContainerForm containers={allContainers} locations={allLocations} />
          </div>
        </details>
      </div>

      {/* Locations */}
      <section className="space-y-1">
        {locations.map((location) => {
          const tree = buildContainerTree(location.containers)
          const itemCount = location.containers.reduce((sum, c) => sum + c.items.length, 0)

          return (
            <div
              key={location.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-1 sm:p-1"
            >
              {/* Location header */}
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 break-words">
                    {location.name}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Containers: {tree.length}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Items: {itemCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location body */}
              <div className="mt-1">
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
          )
        })}
      </section>
    </main>
  )
}
