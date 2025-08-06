'use client'

import { useState } from 'react'

export default function ItemMover({ containers, items }: {
  containers: { id: string; name: string }[]
  items: { id: string; title: string; containerId: string }[]
}) {
  const [selectedItem, setSelectedItem] = useState(items[0]?.id || '')
  const [newContainerId, setNewContainerId] = useState(containers[0]?.id || '')

  async function handleMove(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({ itemId: selectedItem, containerId: newContainerId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Item moved successfully!')
    } else {
      alert('Failed to move item')
    }
  }

  return (
    <form onSubmit={handleMove} className="bg-white p-4 rounded-xl shadow mb-8 space-y-4">
      <h3 className="text-xl font-semibold">Move Item to Another Container</h3>

      <div>
        <label className="block text-sm font-medium">Select Item</label>
        <select
          value={selectedItem}
          onChange={e => setSelectedItem(e.target.value)}
          className="w-full border rounded p-2"
        >
          {items.map(i => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">New Container</label>
        <select
          value={newContainerId}
          onChange={e => setNewContainerId(e.target.value)}
          className="w-full border rounded p-2"
        >
          {containers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Move Item
      </button>
    </form>
  )
}