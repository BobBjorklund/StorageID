'use client';

import { UploadButton } from '@/utils/uploadthing';
import { useEffect, useRef } from 'react';

export default function Uploader({ itemId, onSaved }: { itemId: string; onSaved?: (url: string) => void }) {
  const uploadButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the UploadThing input and enhance it for mobile
    if (uploadButtonRef.current) {
      const fileInput = uploadButtonRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        // Add mobile capture attributes
        fileInput.setAttribute('accept', 'image/*');
        fileInput.setAttribute('capture', 'environment');
        
        console.log('Enhanced UploadThing input for mobile:', fileInput);
      }
    }
  }, []);

  return (
    <div ref={uploadButtonRef} className="w-full max-w-md mx-auto">
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

          // Save to DB with error handling for serverless
          try {
            const r = await fetch('/api/items/set-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemId, url }),
            });

            if (!r.ok) {
              const errorText = await r.text();
              throw new Error(`API Error: ${r.status} - ${errorText}`);
            }
          } catch (error) {
            console.error('Failed to save image URL:', error);
            alert('Upload succeeded but failed to save to database. Please try again.');
            return;
          }

          onSaved?.(url);
        }}
        onUploadError={(err) => {
          console.error('Upload error:', err);
          alert(`Upload failed: ${err?.message ?? 'Unknown error'}`);
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium w-full",
          container: "flex items-center gap-2 w-full"
        }}
      />
      
      {/* Optional: Add instructions for mobile users */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Tap to take photo or choose from files
      </p>
    </div>
  );
}