'use client';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";

export default function Uploader() {
  return (
    <UploadButton<OurFileRouter, "imageUploader">
      endpoint="imageUploader"
      url="/api/uploadthing/core" // 👈 This matches your file path if you deployed it under /api/uploadthing/core.ts
      onClientUploadComplete={(res) => {
        console.log("Upload complete!", res)
      }}
      onUploadError={(error) => {
        console.error("Upload failed", error)
      }}
    />
  )
}