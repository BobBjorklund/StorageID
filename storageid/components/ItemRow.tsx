'use client'

import { useState } from 'react'
import { Item } from '@prisma/client'

export default function ItemRow({ item, containers }: {
  item: Item
  containers: { id: string; name: string }[]
}) {
  const [targetId, setTargetId] = useState(item.containerId)

  async function moveItem() {
    const res = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({ itemId: item.id, containerId: targetId }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Moved!')
    } else {
      alert('Error')
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-2 border">{item.title}</td>
      <td className="p-2 border">{item.description || '-'}</td>
      <td className="p-2 border">
        <select value={targetId} onChange={e => setTargetId(e.target.value)} className="border p-1 rounded">
          {containers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button onClick={moveItem} className="ml-2 px-2 py-1 text-sm bg-indigo-600 text-white rounded">Move</button>
      </td>
    </tr>
  )
}