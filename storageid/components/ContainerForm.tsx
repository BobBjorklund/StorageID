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
      className="rounded-lg border border-gray-200 bg-white shadow-sm p-1 sm:p-1 sm:px-1 space-y-1"
    >
      <h3 className="text-sm sm:text-base font-semibold text-gray-800">Add New Container</h3>

      {/* Name */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

      {/* Parent Container */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">
          Parent Container (optional)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

      {/* Submit */}
      <button
        type="submit"
        className="w-full sm:w-auto rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Add Container
      </button>
    </form>
  )
}
