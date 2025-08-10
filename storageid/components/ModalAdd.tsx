// app/components/ModalAdd.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import ItemForm from './ItemForm'
import ContainerForm from './ContainerForm'

type ModalAddProps = {
  open: boolean
  onClose: () => void
  /** Preselected type to show initially */
  selectedType?: 'item' | 'container'
  /** If provided, lock location to this id */
  selectedLocationId?: string | null
  /** If provided, lock container/parent to this id */
  selectedContainerId?: string | null
  /** All locations in the system */
  locations: { id: string; name: string }[]
  /**
   * All containers in the system with their locationId.
   * (We only pass {id,name} down to children, but we need locationId here for filtering/wiring.)
   */
  containers: { id: string; name: string; locationId: string | null }[]
}

export default function ModalAdd({
  open,
  onClose,
  selectedType = 'item',
  selectedLocationId = null,
  selectedContainerId = null,
  locations,
  containers,
}: ModalAddProps) {
  // UI mode (tab) inside modal
  const [mode, setMode] = useState<'item' | 'container'>(selectedType)

  // Local chooser state for Item mode (ItemForm itself has only a container select)
  const [locId, setLocId] = useState<string>(selectedLocationId ?? '')
  const [contId, setContId] = useState<string>(selectedContainerId ?? '')

  // Lock rules
  const lockLocation = Boolean(selectedLocationId)
  const lockContainer = Boolean(selectedContainerId)

  // Keep internal state in sync if the parent opens modal with new defaults
  useEffect(() => {
    if (!open) return
    setMode(selectedType)
    setLocId(selectedLocationId ?? '')
    setContId(selectedContainerId ?? '')
  }, [open, selectedType, selectedLocationId, selectedContainerId])

  // When a container is chosen that lives in a different location than the currently selected loc,
  // auto-sync the location to the container's true location (per requirement).
  useEffect(() => {
    if (!contId) return
    const c = containers.find((x) => x.id === contId)
    if (!c) return
    const trueLoc = c.locationId ?? ''
    if (trueLoc && trueLoc !== locId) {
      setLocId(trueLoc)
    }
  }, [contId, containers, locId])

  // Helpers
  const toKV = <T extends { id: string; name: string }>(arr: T[]) =>
    arr.map(({ id, name }) => ({ id, name }))

  const reorderFirst = <T extends { id: string }>(arr: T[], firstId?: string) => {
    if (!firstId) return arr
    const idx = arr.findIndex((x) => x.id === firstId)
    if (idx <= 0) return arr
    const copy = arr.slice()
    const [picked] = copy.splice(idx, 1)
    copy.unshift(picked)
    return copy
  }

  // Filtered choices for the top-of-modal selectors (used visually in Item mode)
  const locationChoices = useMemo(() => {
    if (lockLocation && selectedLocationId) {
      const locked = locations.filter((l) => l.id === selectedLocationId)
      return locked
    }
    return locations
  }, [lockLocation, selectedLocationId, locations])

  const containerChoices = useMemo(() => {
    // If container is locked: show only that container
    if (lockContainer && selectedContainerId) {
      return containers.filter((c) => c.id === selectedContainerId)
    }
    // If a location is selected (either locked or chosen), filter containers to that location
    if (locId) {
      return containers.filter((c) => c.locationId === locId)
    }
    // Otherwise show all
    return containers
  }, [lockContainer, selectedContainerId, containers, locId])

  // Data passed down to ItemForm
  const itemFormContainers = useMemo(() => {
    const base = containerChoices
    const ordered = reorderFirst(base, contId || selectedContainerId || undefined)
    return toKV(ordered)
  }, [containerChoices, contId, selectedContainerId])

  // Data passed down to ContainerForm
  // Lock logic:
  // - If location provided, pass only that location.
  // - If container provided, pass only that container as potential parent (ContainerForm still shows "None" internally).
  // - Otherwise, location list is all, parent list is filtered by currently selected location (if any).
  const containerFormLocations = useMemo(() => {
    if (lockLocation && selectedLocationId) {
      const locked = locations.filter((l) => l.id === selectedLocationId)
      return toKV(locked)
    }
    // When not locked, prefer the currently selected location (so it becomes default in the child)
    const ordered = reorderFirst(locations, locId || undefined)
    return toKV(ordered)
  }, [lockLocation, selectedLocationId, locations, locId])

  const containerFormParents = useMemo(() => {
    if (lockContainer && selectedContainerId) {
      const locked = containers.filter((c) => c.id === selectedContainerId)
      return toKV(locked)
    }
    const parents = locId
      ? containers.filter((c) => c.locationId === locId)
      : containers
    const ordered = reorderFirst(parents, contId || undefined)
    return toKV(ordered)
  }, [lockContainer, selectedContainerId, containers, locId, contId])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-2"
      role="dialog"
      aria-modal="true"
      aria-label="Add modal"
      onClick={(e) => {
        // click on backdrop closes
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Add</h2>
            {/* Mode switch */}
            <div className="inline-flex overflow-hidden rounded border border-gray-300">
              <button
                type="button"
                onClick={() => setMode('item')}
                aria-pressed={mode === 'item'}
                className={`px-2 py-0.5 text-[11px] ${
                  mode === 'item' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'
                }`}
              >
                Item
              </button>
              <button
                type="button"
                onClick={() => setMode('container')}
                aria-pressed={mode === 'container'}
                className={`px-2 py-0.5 text-[11px] border-l border-gray-300 ${
                  mode === 'container' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-50'
                }`}
              >
                Container
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-2 space-y-2">
          {/* Top filters for ITEM mode only (ItemForm has no location select of its own) */}
          {mode === 'item' && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Location select (visible unless it's locked and singular) */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Location</label>
                <select
                  value={locId}
                  onChange={(e) => setLocId(e.target.value)}
                  disabled={lockLocation}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {/* If locked, array is a single location; if not, it's full list */}
                  {locationChoices.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Container select (visible for preview / syncing even though ItemForm also has a select) */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Container</label>
                <select
                  value={contId}
                  onChange={(e) => setContId(e.target.value)}
                  disabled={lockContainer}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {containerChoices.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Forms */}
          {mode === 'item' ? (
            // ItemForm expects containers: {id,name}[]
            <ItemForm containers={itemFormContainers} />
          ) : (
            // ContainerForm expects: containers: {id,name}[] and locations: {id,name}[]
            // Locking is achieved by passing filtered arrays (singletons when locked).
            <ContainerForm
              containers={containerFormParents}
              locations={containerFormLocations}
            />
          )}
        </div>
      </div>
    </div>
  )
}
