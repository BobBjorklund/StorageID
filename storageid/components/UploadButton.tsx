'use client';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";

export default function Uploader() {
  return (
    <UploadButton<OurFileRouter>
      endpoint="imageUploader"
      url="/api/uploadthing/core" // 👈 THIS is the key line
      onClientUploadComplete={(res) => {
        console.log("Upload complete!", res);
        alert("Upload complete!");
      }}
      onUploadError={(error) => {
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
}
