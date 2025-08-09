'use client'

import { UploadButton } from '@/utils/uploadthing'

export default function MyUploadButton() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log('✅ Upload complete', res)
      }}
      onUploadError={(error) => {
        console.error('❌ Upload failed', error)
      }}
    />
  )
}
