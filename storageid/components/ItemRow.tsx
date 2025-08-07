'use client'

import { useState } from 'react'
import { Item } from '@prisma/client'



export default function ItemRow({ item, containers, locations }: {
  item: Item
  containers: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}) {
  const [targetContainerId, setTargetContainerId] = useState(item.containerId)
  const [targetLocationId, setTargetLocationId] = useState('')

  async function moveToContainer() {
    const res = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({ itemId: item.id, containerId: targetContainerId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Moved to container!')
    } else {
      alert('Error moving item to container')
    }
  }
async function moveToLocation() {
  const selectedLoc = locations.find(loc => loc.id === targetLocationId)
  if (!selectedLoc) return alert('No location selected')

  const res = await fetch('/api/doompile', {
    method: 'POST',
    body: JSON.stringify({
      locationId: selectedLoc.id,
      locationName: selectedLoc.name,
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) return alert('Failed to get/create DOOMPILE')

  const { id: doompileId } = await res.json()

  // Now move the item into that DOOMPILE
  const moveRes = await fetch('/api/items/move', {
    method: 'POST',
    body: JSON.stringify({
      itemId: item.id,
      containerId: doompileId,
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (moveRes.ok) {
    alert(`Item dropped into ${selectedLoc.name}_DOOMPILE`)
  } else {
    alert('Move failed')
  }
}
 

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-2 border">{item.title}</td>
      <td className="p-2 border">{item.description || '-'}</td>
      <td className="p-2 border">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="Item" className="h-12 rounded object-cover" />
        ) : <span>-</span>}
      </td>
      <td className="p-2 border">
        {/* Move to container */}
        <select
          value={targetContainerId}
          onChange={e => setTargetContainerId(e.target.value)}
          className="border p-1 rounded"
        >
          {containers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button onClick={moveToContainer} className="ml-2 px-2 py-1 text-sm bg-indigo-600 text-white rounded">
          Move
        </button>
      </td>
      <td className="p-2 border">
        {/* Move to location */}
        <select
          value={targetLocationId}
          onChange={e => setTargetLocationId(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">Choose location</option>
          {locations?.length > 0 && locations.map(loc => (
  <option key={loc.id} value={loc.id}>{loc.name}</option>
))}
        </select>
        <button onClick={moveToLocation} className="ml-2 px-2 py-1 text-sm bg-green-600 text-white rounded">
          Move to Location
        </button>
      </td>
    </tr>
  )
}
