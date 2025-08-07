'use client'

import { useState } from 'react'

export default function ContainerForm({
  containers = [],
  locations = [],
}: {
  containers: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}) {
  const [name, setName] = useState('')
  const [locationId, setLocationId] = useState(locations[0]?.id || '')
  const [parentId, setParentId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/containers', {
      method: 'POST',
      body: JSON.stringify({ name, locationId, parentId: parentId || null }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      setName('')
      setParentId('')
      alert('Container added!')
    } else {
      alert('Failed to add container')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow mb-8 space-y-4"
    >
      <h3 className="text-xl font-semibold">Add New Container</h3>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full border rounded p-2"
        >
          {locations.length > 0 ? (
            locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))
          ) : (
            <option disabled>No locations available</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Parent Container (optional)</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">None</option>
          {containers.length > 0 ? (
            containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          ) : (
            <option disabled>No containers available</option>
          )}
        </select>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Container
      </button>
    </form>
  )
}
