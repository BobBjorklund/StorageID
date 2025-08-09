
// /app/api/uploadthing/route.ts
import { NextRequest } from 'next/server'
import { createRouteHandler } from 'uploadthing/next'
import { OurFileRouter } from '@/uploadthing.config'

// Create the handlers
const handlers = createRouteHandler({ router: OurFileRouter })

// Don't consume the body - just log headers and method
export async function POST(req: NextRequest) {
  console.log('📥 Upload incoming to /api/uploadthing')
  
  // Only log headers and method - don't touch the body
  const headers = Object.fromEntries(req.headers.entries())
  console.log('📨 Headers:', {
    'content-type': headers['content-type'],
    'content-length': headers['content-length'],
    'user-agent': headers['user-agent']
  })
  console.log('🔍 Method:', req.method)

  // Pass the untouched request to UploadThing
  return handlers.POST(req)
}

export const GET = handlers.GET