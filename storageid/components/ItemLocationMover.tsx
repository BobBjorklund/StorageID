'use client'

import { useState } from 'react'

export default function ItemLocationMover({
  items,
  locations,
}: {
  items: { id: string; title: string }[]
  locations: { id: string; name: string }[]
}) {
  const [itemId, setItemId] = useState(items[0]?.id || '')
  const [locationId, setLocationId] = useState(locations[0]?.id || '')

  async function handleMove(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/items/move-location', {
      method: 'POST',
      body: JSON.stringify({ itemId, locationId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Item moved to new location!')
    } else {
      alert('Failed to move item.')
    }
  }

  return (
    <form
      onSubmit={handleMove}
      className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8 space-y-5"
    >
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
        Move Item to Location
      </h3>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Select Item</label>
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Select Location</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
      >
        Move
      </button>
    </form>
  )
}
