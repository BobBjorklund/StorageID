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
      className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8 space-y-5"
    >
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Add New Container</h3>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded p-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full border rounded p-2 text-sm"
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

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Parent Container (optional)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border rounded p-2 text-sm"
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
        className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
      >
        Add Container
      </button>
    </form>
  )
}
