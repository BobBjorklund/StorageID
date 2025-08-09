import { generateUploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/uploadthing.config'

export const UploadButton = generateUploadButton<typeof OurFileRouter>()