import { NextResponse } from 'next/server'
import { getAllLocations } from '../../lib/db/locations'

export async function GET() {
  try {
    const locations = await getAllLocations()
    console.log('✅ Fetched locations:', locations)
    return NextResponse.json(locations)
  } catch (error) {
    console.error('❌ Failed to fetch locations:', error)
    return new NextResponse('Error fetching locations', { status: 500 })
  }
}
