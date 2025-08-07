// lib/data-fetch.ts
'use client'

import { useEffect, useState } from 'react'
import { ContainerWithDetails } from '@/app/types'

type LocationData = {
  id: string
  name: string
  containers: ContainerWithDetails[]
}

export function useStorageData() {
  const [data, setData] = useState<{
    locations: LocationData[]
    allContainers: { id: string; name: string; locationId: string | null }[]
    allLocations: { id: string; name: string }[]
  } | null>(null)

  useEffect(() => {
  fetch('/api/items')
    .then(async res => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const json = await res.json()
      console.log('🧪 Received from /api/items:', json) // 👈 ADD THIS
      return json
    })
    .then(setData)
    .catch(err => {
      console.error('❌ Failed to load storage data:', err)
    })
}, [])
  console.log('useStorageData data', data)
  return data
}
