"use client";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/uploadthing.config";

const UploadButton = generateUploadButton<typeof OurFileRouter>();

export default function TestUploadPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upload Test</h1>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log("✅ Upload complete", res);
        }}
        onUploadError={(err) => {
          console.error("❌ Upload error", err);
        }}
      />
    </div>
  );
}