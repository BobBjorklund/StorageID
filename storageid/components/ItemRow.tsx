'use client'

import { useState } from 'react'
import { Item } from '@prisma/client'
import Uploader from './MyUploadButton'
export default function ItemRow({
  item,
  containers,
  locations
}: {
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
      headers: { 'Content-Type': 'application/json' }
    })
    alert(res.ok ? 'Moved to container!' : 'Error moving item to container')
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`/api/items/delete`, {
      method: 'POST',
      body: JSON.stringify({ itemId }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      alert('Item deleted!')
      location.reload()
    } else {
      alert('Could not delete item')
    }
  }

  async function updateQty(itemId: string, quantity: number) {
    const res = await fetch('/api/items/update-quantity', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) alert('Failed to update quantity')
    else location.reload()
  }

  async function moveToLocation() {
    const selectedLoc = locations.find(loc => loc.id === targetLocationId)
    if (!selectedLoc) return alert('No location selected')

    const res = await fetch('/api/doompile', {
      method: 'POST',
      body: JSON.stringify({
        locationId: selectedLoc.id,
        locationName: selectedLoc.name
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) return alert('Failed to get/create DOOMPILE')

    const { id: doompileId } = await res.json()

    const moveRes = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({
        itemId: item.id,
        containerId: doompileId
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    alert(moveRes.ok ? `Item dropped into ${selectedLoc.name}_DOOMPILE` : 'Move failed')
  }

  return (
  <div className="border rounded-xl p-4 mb-4 shadow-sm bg-white flex flex-col sm:flex-row sm:items-start gap-4">
    {/* Left side: Title + controls */}
    <div className="flex-1 space-y-2">
      <p className="text-base font-semibold">Title: {item.title}</p>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Move to Container:</label>
        <select
          value={targetContainerId ?? ''}
          onChange={(e) => setTargetContainerId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {containers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={moveToContainer}
          className="text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-sm"
        >
          Move
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Move to Location:</label>
        <select
          value={targetLocationId}
          onChange={(e) => setTargetLocationId(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Choose location</option>
          {locations?.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        <button
          onClick={moveToLocation}
          className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
        >
          Move
        </button>
      </div>
          <div className='flex gap-2'>
            <h1>Upload an Image</h1>
      <Uploader />
          </div>
      <div className="flex gap-2">
        <button
          onClick={() => deleteItem(item.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
        <div className="flex items-center gap-1">
          <span className="font-medium">Qty:</span>
          <button
            onClick={() => updateQty(item.id, item.quantity + 1)}
            className="bg-green-500 hover:bg-green-600 text-white px-2 rounded"
          >
            +
          </button>
          <span className="px-2">{item.quantity}</span>
          <button
            onClick={() => updateQty(item.id, item.quantity - 1)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 rounded"
          >
            -
          </button>
        </div>
      </div>
    </div>

    {/* Right side: Image + Description */}
    <div className="sm:w-1/3 border-l sm:pl-4 text-sm text-gray-600">
      <p className="mb-2">
        <span className="font-medium">Description:</span>{' '}
        {item.description || <span className="italic text-gray-400">None</span>}
      </p>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt="Item"
          className="rounded max-w-full max-h-32 object-contain border"
        />
      ) : (
        <div className="italic text-gray-400">No image</div>
      )}
    </div>
  </div>
)
}