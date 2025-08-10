// app/components/ItemRow.tsx
'use client'

import { useMemo, useState } from 'react'
import { Item } from '@prisma/client'
import Uploader from './MyUploadButton'
import Image from 'next/image'

export default function ItemRow({
  item,
  containers,
  locations,
}: {
  item: Item
  containers: { id: string; name: string; locationId: string | null }[]
  locations: { id: string; name: string }[]
}) {
  const [targetContainerId, setTargetContainerId] = useState<string>(item.containerId ?? '')
  const [targetLocationId, setTargetLocationId] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl ?? '')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [moveTab, setMoveTab] = useState<'location' | 'container'>('location')
  // NEW: controlled quantity input (no styling changes)
  const [qtyInput, setQtyInput] = useState<string>(String(item.quantity))

  // derive current location via item's container
  const currentLocationId = useMemo(() => {
    if (!item.containerId) return null
    const currentContainer = containers.find((c) => c.id === item.containerId)
    return currentContainer?.locationId ?? null
  }, [item.containerId, containers])

  // eligible containers: same location, not current
  const eligibleContainers = useMemo(() => {
    if (!currentLocationId) return []
    return containers
      .filter((c) => c.locationId === currentLocationId && c.id !== item.containerId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [containers, currentLocationId, item.containerId])

  function parseQty(val: string): number {
    const n = Number.parseInt(val.replace(/[^\d-]/g, ''), 10)
    if (Number.isNaN(n)) return 0
    return Math.max(0, n)
  }

  async function moveToContainer() {
    if (!targetContainerId) {
      alert('Pick a container first')
      return
    }
    const res = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({ itemId: item.id, containerId: targetContainerId }),
      headers: { 'Content-Type': 'application/json' },
    })
    alert(res.ok ? 'Moved to container!' : 'Error moving item to container')
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`/api/items/delete`, {
      method: 'POST',
      body: JSON.stringify({ itemId }),
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) alert('Failed to update quantity')
    else location.reload()
  }

  async function moveToLocation() {
    const selectedLoc = locations.find((loc) => loc.id === targetLocationId)
    if (!selectedLoc) {
      alert('No location selected')
      return
    }

    const res = await fetch('/api/doompile', {
      method: 'POST',
      body: JSON.stringify({
        locationId: selectedLoc.id,
        locationName: selectedLoc.name,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      alert('Failed to get/create DOOMPILE')
      return
    }

    const { id: doompileId } = await res.json()

    const moveRes = await fetch('/api/items/move', {
      method: 'POST',
      body: JSON.stringify({
        itemId: item.id,
        containerId: doompileId,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    alert(moveRes.ok ? `Item dropped into ${selectedLoc.name}_DOOMPILE` : 'Move failed')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white/90 shadow-sm transition-all hover:shadow-md">
      <div className="p-2.5 md:p-3">
        {/* Header — compact, info-dense */}
        <div className="flex items-center gap-2">
          {/* playful accent pill */}
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {item.title}
            </h3>
            {/* micro-underline for a touch of flair */}
            <div className="mt-0.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
          </div>

          {/* collapsed chips */}
          {!isExpanded && (
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
              <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-medium">
                {item.quantity}
              </span>
              {imageUrl && (
                <div className="h-6 w-6 overflow-hidden rounded border">
                  <Image
                    src={imageUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* toggle */}
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
            onClick={() => setIsExpanded((v) => !v)}
            className="ml-1 rounded p-1 transition-colors hover:bg-gray-100"
          >
            <svg
              className={`h-3.5 w-3.5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'mt-2 max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {/* LEFT SIDE */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:auto-rows-min">
              {/* Row 1: Move | Actions */}
              <section className="rounded-md border border-gray-200 bg-white/80 p-2 md:col-span-1 hover:border-indigo-200 transition-colors">
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="flex items-center gap-2 text-[11px] font-medium text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                    Move
                  </h4>
                  {/* segmented control */}
                  <div className="ml-auto inline-flex overflow-hidden rounded border border-gray-300">
                    <button
                      type="button"
                      aria-pressed={moveTab === 'location'}
                      onClick={() => setMoveTab('location')}
                      className={`px-2 py-0.5 text-[11px] ${
                        moveTab === 'location' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      Location
                    </button>
                    <button
                      type="button"
                      aria-pressed={moveTab === 'container'}
                      onClick={() => setMoveTab('container')}
                      className={`px-2 py-0.5 text-[11px] border-l border-gray-300 ${
                        moveTab === 'container' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      Container
                    </button>
                  </div>
                </div>

                {/* LOCATION TAB */}
                <div className={moveTab === 'location' ? 'block' : 'hidden'}>
                  <label className="mb-1 block text-[11px] font-medium text-gray-700">Select location</label>
                  <select
                    value={targetLocationId}
                    onChange={(e) => setTargetLocationId(e.target.value)}
                    className="mb-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Choose…</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={moveToLocation}
                    className="w-full rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-emerald-700"
                  >
                    Move to Location
                  </button>
                </div>

                {/* CONTAINER TAB */}
                <div className={moveTab === 'container' ? 'block' : 'hidden'}>
                  <label className="mb-1 mt-1 block text-[11px] font-medium text-gray-700">Select container</label>
                  <select
                    value={targetContainerId}
                    onChange={(e) => setTargetContainerId(e.target.value)}
                    className="mb-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Choose…</option>
                    {eligibleContainers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={moveToContainer}
                    disabled={!targetContainerId}
                    className="w-full rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move to Container
                  </button>
                </div>
              </section>

              <section className="rounded-md border border-gray-200 bg-white/80 p-2 md:col-span-1">
                <h4 className="mb-1 flex items-center gap-2 text-[11px] font-medium text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  Actions
                </h4>
                <div className="mb-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseQty(qtyInput)
                      const next = Math.max(0, cur - 1)
                      setQtyInput(String(next))
                      void updateQty(item.id, next)
                    }}
                    className="rounded bg-gray-600 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-gray-700"
                  >
                    −
                  </button>

                  {/* REPLACED span with input (same classes, no styling change) */}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                    onBlur={() => {
                      const next = parseQty(qtyInput)
                      if (next !== item.quantity) {
                        void updateQty(item.id, next)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Commit on Enter
                        (e.currentTarget as HTMLInputElement).blur()
                      }
                    }}
                    className="min-w-[2.25rem] rounded border bg-white px-2 py-0.5 text-center text-xs font-medium"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseQty(qtyInput)
                      const next = cur + 1
                      setQtyInput(String(next))
                      void updateQty(item.id, next)
                    }}
                    className="rounded bg-gray-600 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="w-full rounded bg-red-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                >
                  Delete
                </button>
              </section>

              {/* Row 2: Description spanning both columns */}
              <section className="rounded-md border border-gray-200 bg-gray-50 p-2 md:col-span-2">
                <h4 className="mb-1 text-[11px] font-medium text-gray-700">Description</h4>
                <p className="text-xs leading-tight text-gray-700">
                  {item.description ? (
                    item.description
                  ) : (
                    <span className="italic text-gray-400">None</span>
                  )}
                </p>
              </section>

              {/* Row 3: Uploader spanning both columns */}
              <section className="rounded-md border border-gray-200 bg-white/80 p-2 md:col-span-2">
                <h4 className="mb-1 flex items-center gap-2 text-[11px] font-medium text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
                  Upload
                </h4>
                <div className="[&_*button]:text-xs [&_*button]:px-2 [&_*button]:py-1 sm:[&_*button]:text-sm">
                  <Uploader itemId={item.id} onSaved={(url) => setImageUrl(url)} />
                </div>
              </section>
            </div>

            {/* RIGHT SIDE: Image */}
            <div>
              <section className="rounded-md border border-gray-200 bg-gray-50 p-2">
                <h4 className="mb-1 text-[11px] font-medium text-gray-700">Image</h4>
                {imageUrl ? (
                  <div className="relative w-full overflow-hidden rounded border">
                    <div className="relative w-full aspect-video max-h-64">
                      <Image
                        src={imageUrl}
                        alt={item.title || 'Item image'}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center rounded border border-dashed border-gray-300 bg-white">
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
