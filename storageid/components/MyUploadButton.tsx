'use client';

import { UploadButton } from '@/utils/uploadthing';
import { useRef } from 'react';

export default function Uploader({
  itemId,
  onSaved,
  uploadPicture, // optional hook to your existing upload flow
}: {
  itemId: string;
  onSaved?: (url: string) => void;
  uploadPicture?: (files: FileList, ctx: { itemId: string; onSaved?: (url: string) => void }) => Promise<void> | void;
}) {
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center gap-2">
      {/* Desktop / tablet: keep existing UploadThing button */}
      <div className="hidden sm:flex">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={async (res) => {
            type UploadResponse = { serverData?: { fileUrl?: string }; url?: string };
            const first = res?.[0] as UploadResponse | undefined;
            const url = first?.serverData?.fileUrl ?? first?.url;
            if (!url) return;

            const r = await fetch('/api/items/set-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId, url }),
            });
            if (!r.ok) return;

            onSaved?.(url);
          }}
          onUploadError={(err) => {
            console.error('Upload error:', err);
            alert(`Upload failed: ${err?.message ?? 'Unknown error'}`);
          }}
          appearance={{
            button: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded',
            container: 'flex items-center gap-2',
          }}
        />
      </div>

      {/* Mobile-only: native camera/library picker that hooks into your uploadPicture() */}
      <div className="sm:hidden flex items-center gap-2">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          onClick={() => mobileInputRef.current?.click()}
        >
          Upload Image
        </button>
        <input
          ref={mobileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (e) => {
            if (!e.target.files?.length) return;
            if (uploadPicture) {
              await uploadPicture(e.target.files, { itemId, onSaved });
            }
            // If you also want to clear the input after:
            e.currentTarget.value = '';
          }}
        />
      </div>
    </div>
  );
}
