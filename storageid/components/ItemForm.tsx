'use client'

import { useState } from 'react'
import Uploader from './MyUploadButton'
export default function ItemForm({
  containers = []
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
      headers: { 'Content-Type': 'application/json' }
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
      className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8 space-y-5"
    >
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Add New Item</h3>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full border rounded p-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
        <input
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="Paste image URL here"
        />
        {imageUrl && (
          <div className="mt-1 max-w-xs sm:max-w-sm">
            <img
              src={imageUrl}
              alt="Preview"
              className="rounded border w-full h-auto object-contain"
            />
          </div>
        )}
        <Uploader />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Container</label>
        <select
          value={containerId}
          onChange={e => setContainerId(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        >
          {containers.length > 0 ? (
            containers.map(c => (
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
        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        Add Item
      </button>
    </form>
  )
}
