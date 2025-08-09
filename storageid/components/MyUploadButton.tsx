'use client'

import { UploadButton } from '@/utils/uploadthing'

export default function MyUploadButton() {
  return (
   <UploadButton
  endpoint="imageUploader"
  onClientUploadComplete={(res) => {
    console.log("✅ Upload complete (client)", res);
    // Show the uploaded URL if present:
    alert(`Uploaded ${res?.[0]?.name ?? "file"}`);
  }}
  onUploadError={(err) => {
    // This often has useful info in prod
    console.error("❌ Upload error (client):", err);
    alert(`Upload failed: ${err?.message ?? "Unknown error"}`);
  }}
/>
  )
}
