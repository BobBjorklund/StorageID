'use client'

import { useSearchParams } from 'next/navigation'
import ContainerCard from '../components/ContainerCard'
import ItemForm from '../components/ItemForm'
import ContainerForm from '../components/ContainerForm'
import { useEffect, useState } from 'react'
import { ContainerWithDetails } from './types'

function buildContainerTree(containers: ContainerWithDetails[]): ContainerWithDetails[] {
  const containerMap = new Map<string, ContainerWithDetails>()
  const roots: ContainerWithDetails[] = []

  containers.forEach(container => {
    container.children = []
    containerMap.set(container.id, container)
  })

  containers.forEach(container => {
    if (container.parentId) {
      const parent = containerMap.get(container.parentId)
      parent?.children?.push(container)
    } else {
      roots.push(container)
    }
  })

  return roots
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')?.toLowerCase() || ''

  const [data, setData] = useState<{
    locations: {
      id: string
      name: string
      containers: ContainerWithDetails[]
    }[]
    allContainers: { id: string; name: string; locationId: string | null }[]
    allLocations: { id: string; name: string }[]
  } | null>(null)

  useEffect(() => {
    fetch('/api/storage')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return <div className="p-4">Loading...</div>
  }

  const { locations, allContainers, allLocations } = data

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">All Storage Locations</h1>

      <form method="GET" className="mb-6">
        <input
          type="text"
          name="q"
          placeholder="Search items..."
          defaultValue={q}
          className="w-full p-2 border rounded-md text-sm"
        />
      </form>

      <details className="mb-4">
        <summary className="cursor-pointer text-blue-600 hover:underline">+ Add New Item</summary>
        <div className="mt-2">
          <ItemForm containers={allContainers} />
        </div>
      </details>

      <details className="mb-6">
        <summary className="cursor-pointer text-blue-600 hover:underline">+ Add New Container</summary>
        <div className="mt-2">
          <ContainerForm containers={allContainers} locations={allLocations} />
        </div>
      </details>

      {locations.map(location => {
        const tree = buildContainerTree(
          location.containers.filter(container => {
            if (!q) return true
            return (
              container.name.toLowerCase().includes(q) ||
              container.items.some(item =>
                item.title.toLowerCase().includes(q) ||
                (item.description?.toLowerCase().includes(q) ?? false)
              )
            )
          })
        )

        return (
          <div key={location.id} className="mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{location.name}</h2>

            {tree.length > 0 ? (
              tree.map(container => (
                <ContainerCard key={container.id} container={container} allContainers={allContainers} allLocations={allLocations} />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No containers match your search.</p>
            )}
          </div>
        )
      })}
    </main>
  )
}
