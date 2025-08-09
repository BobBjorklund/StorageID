'use client';

import { UploadButton } from '@/utils/uploadthing';

export default function MyUploadButton({ itemId, onSaved }: { itemId: string; onSaved?: (url: string) => void }) {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={async (res) => {
        // Try serverData first (from onUploadComplete); fallback to res[0].url if present
        type UploadResponse = { serverData?: { fileUrl?: string }; url?: string }
const first = res?.[0] as UploadResponse | undefined
const url = first?.serverData?.fileUrl ?? first?.url
        if (!url) {
          console.error('No URL returned from upload');
          return;
        }

        // Save to DB
        const r = await fetch('/api/items/set-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, url }),
        });

        if (!r.ok) {
          console.error('Failed to save image URL');
          return;
        }

        onSaved?.(url); // optional: update UI without reload
      }}
      onUploadError={(err) => {
        console.error('Upload error:', err);
        alert(`Upload failed: ${err?.message ?? 'Unknown error'}`);
      }}
      appearance={{
    button: "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded",
    container: "flex items-center gap-2"
  }}
    />
  );
}