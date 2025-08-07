'use client'

import { useEffect, useState } from 'react'

export default function Test() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/items')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(setItems)
      .catch(err => {
        console.error('❌ Failed to load items:', err)
        setError(err.message)
      })
  }, [])

  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!items.length) return <div>Loading or no items...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Fetched Items</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="border rounded p-2">
            <div><strong>{item.title}</strong></div>
            <div className="text-sm text-gray-600">{item.description}</div>
            {item.imageUrl && <img src={item.imageUrl} className="max-h-32 mt-2" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
