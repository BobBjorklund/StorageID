'use client'

import { useRef, useState } from 'react'
import Uploader from './MyUploadButton'

export default function ItemForm({
  containers = [],
}: {
  containers: { id: string; name: string }[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState<string>('1')
  const [containerId, setContainerId] = useState(containers[0]?.id || '')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)

  const uploaderShellRef = useRef<HTMLDivElement | null>(null)

  function waitForSelector<T extends Element>(
    root: HTMLElement,
    selector: string,
    timeoutMs = 2500
  ): Promise<T> {
    const start = Date.now()
    return new Promise<T>((resolve, reject) => {
      const tick = () => {
        const el = root.querySelector(selector) as T | null
        if (el) return resolve(el)
        if (Date.now() - start > timeoutMs) return reject(new Error(`Selector not found: ${selector}`))
        requestAnimationFrame(tick)
      }
      tick()
    })
  }

  async function injectFileAndUpload(chosenFile: File) {
    const shell = uploaderShellRef.current
    if (!shell) return

    const input = await waitForSelector<HTMLInputElement>(shell, 'input[type="file"]')

    const dt = new DataTransfer()
    dt.items.add(chosenFile)
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))

    const submitBtn =
      (shell.querySelector('button[type="submit"]') as HTMLButtonElement | null) ||
      (shell.querySelector('input[type="submit"]') as HTMLInputElement | null) ||
      (shell.querySelector('button:not([disabled])') as HTMLButtonElement | null)

    if (submitBtn) {
      submitBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return alert('Title is required')

    const qtyNumber = Math.max(0, Number.parseInt(quantity, 10) || 0)

    setLoading(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify({ title, description, quantity: qtyNumber, containerId }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to add item')

      const { id } = (await res.json()) as { id: string }
      setCreatedItemId(id)

      if (file) {
        await new Promise((r) => setTimeout(r, 0))
        await injectFileAndUpload(file)
      }

      alert('Item added successfully!')
      setTitle('')
      setDescription('')
      setQuantity('1')
      setFile(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white shadow-sm p-1 sm:p-1 sm:px-1 space-y-1"
    >
      <h3 className="text-sm sm:text-base font-semibold text-gray-800">Add New Item</h3>

      {/* Title */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Container */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Container</label>
        <select
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
          className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {containers.length ? (
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

      {/* Photo */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-700">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs text-gray-500 file:mr-1 file:rounded file:border-0 file:bg-indigo-50 file:px-1 file:py-0.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Add Item'}
      </button>

      {/* Hidden uploader */}
      <div
        ref={uploaderShellRef}
        className="absolute -left-[9999px] -top-[9999px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        {createdItemId ? (
          <Uploader
            itemId={createdItemId}
            onSaved={() => {
              /* optional confirmation */
            }}
          />
        ) : null}
      </div>
    </form>
  )
}
