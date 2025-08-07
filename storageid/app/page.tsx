// app/page.tsx
'use client'

import { useStorageData } from './lib/db/data-fetch'
import ContainerCard from '@/components/ContainerCard'
import ContainerForm from '@/components/ContainerForm'
import ItemForm from '@/components/ItemForm'
import { useState } from 'react'
import { ContainerWithDetails } from './types'
import ContainerLocationMover from '@/components/ContainerLocationMover'
import ItemLocationMover from '@/components/ItemLocationMover'

function buildContainerTree(containers: ContainerWithDetails[]): ContainerWithDetails[] {
  const map = new Map<string, ContainerWithDetails>()
  const roots: ContainerWithDetails[] = []

  containers.forEach(c => {
    c.children = []
    map.set(c.id, c)
  })

  containers.forEach(c => {
    if (c.parentId) {
      const parent = map.get(c.parentId)
      parent?.children?.push(c)
      c.parent = parent ?? null
    } else {
      roots.push(c)
    }
  })

  return roots
}

function flattenContainers(containers: ContainerWithDetails[]): ContainerWithDetails[] {
  const result: ContainerWithDetails[] = []
  function recurse(c: ContainerWithDetails) {
    result.push(c)
    c.children?.forEach(recurse)
  }
  containers.forEach(recurse)
  return result
}

export default function HomePage() {
  const data = useStorageData()
  const [q, setQ] = useState('')

  if (!data) return <div className="p-4">Loading...</div>

  const { locations, allContainers, allLocations } = data
  const flattenedItems = locations
  .flatMap(loc => loc.containers)
  .flatMap(c => c.items)
  .map(item => ({
    id: item.id,
    title: item.title,
  }))

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">All Storage Locations</h1>

      <input
        type="text"
        placeholder="Search items..."
        value={q}
        onChange={e => setQ(e.target.value.toLowerCase())}
        className="w-full mb-6 p-2 border rounded-md text-sm"
      />

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
<ItemLocationMover items={flattenedItems} locations={allLocations} />
<ContainerLocationMover containers={allContainers} locations={allLocations} />
      {locations.map(location => {
        const filteredContainers = location.containers.filter(c =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.items.some(item =>
            item.title.toLowerCase().includes(q) ||
            (item.description?.toLowerCase().includes(q) ?? false)
          )
        )

        const tree = buildContainerTree(filteredContainers)
        const flat = flattenContainers(tree)
        console.log("tree length / allLocations", tree.length, allLocations)
        return (
          <div key={location.id} className="mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{location.name}</h2>
            {tree.length ? tree.map(c => (
              <ContainerCard key={c.id} container={c} allContainers={flat} allLocations={allLocations} />
              
            )) : (
              <p className="text-sm italic text-gray-500">No matching containers.</p>
            )}
          </div>
        )
      })}
    </main>
  )
}
