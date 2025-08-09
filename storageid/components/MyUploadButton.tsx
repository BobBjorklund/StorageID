'use client';

import { useRef } from 'react';

export default function Uploader({
  itemId,
  onSaved,
}: {
  itemId: string;
  onSaved?: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('files', file);

    try {
      const uploadRes = await fetch('/api/uploadthing?slug=imageUploader', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const resJson = await uploadRes.json();

      const url =
        resJson?.[0]?.serverData?.fileUrl ?? resJson?.[0]?.url;
      if (!url) throw new Error('No file URL returned');

      const r = await fetch('/api/items/set-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, url }),
      });

      if (!r.ok) throw new Error('Failed to save image URL');

      onSaved?.(url);
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        Upload Image
      </button>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
