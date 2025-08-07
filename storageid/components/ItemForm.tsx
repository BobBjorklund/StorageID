'use client'

import { useState } from 'react'

export default function ItemForm({
  containers = [],
}: {
  containers: { id: string; name: string }[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [containerId, setContainerId] = useState(containers[0]?.id || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({ title, description, imageUrl, containerId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      setTitle('')
      setDescription('')
      setImageUrl('')
      alert('Item added!')
    } else {
      alert('Failed to add item')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow mb-8 space-y-4"
    >
      <h3 className="text-xl font-semibold">Add New Item</h3>

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL (optional)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Paste image URL here"
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-32 rounded border"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Container</label>
        <select
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
          className="w-full border rounded p-2"
        >
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Item
      </button>
    </form>
  )
}
