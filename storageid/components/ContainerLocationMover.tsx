'use client'

import { useState } from 'react'

export default function ContainerLocationMover({ containers, locations }: {
  containers: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}) {
  const [containerId, setContainerId] = useState(containers[0]?.id || '')
  const [locationId, setLocationId] = useState(locations[0]?.id || '')

  async function handleMove(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/containers/move-location', {
      method: 'POST',
      body: JSON.stringify({ containerId, locationId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Container moved to new location!')
    } else {
      alert('Failed to move container.')
    }
  }

  return (
    <form onSubmit={handleMove} className="bg-white p-4 rounded-xl shadow mb-8 space-y-4">
      <h3 className="text-xl font-semibold">Move Container to Location</h3>

      <div>
        <label className="block text-sm font-medium">Select Container</label>
        <select value={containerId} onChange={e => setContainerId(e.target.value)} className="w-full border rounded p-2">
          {containers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Select Location</label>
        <select value={locationId} onChange={e => setLocationId(e.target.value)} className="w-full border rounded p-2">
          {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
      </div>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Move
      </button>
    </form>
  )
}
