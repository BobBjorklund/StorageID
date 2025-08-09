'use client';

import { UploadButton } from '@/utils/uploadthing';
import { useEffect, useRef, useState } from 'react';

export default function Uploader({ itemId, onSaved }: { itemId: string; onSaved?: (url: string) => void }) {
  const uploadButtonRef = useRef<HTMLDivElement>(null);
  const [showSourceChoice, setShowSourceChoice] = useState(false);

  useEffect(() => {
    // Find and enhance the UploadThing input
    if (uploadButtonRef.current) {
      const fileInput = uploadButtonRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      const button = uploadButtonRef.current.querySelector('button') as HTMLButtonElement;
      
      if (fileInput && button) {
        // Set basic image acceptance
        fileInput.setAttribute('accept', 'image/*');
        
        // Hijack the button click to show our choice first
        const originalClick = button.onclick;
        button.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowSourceChoice(true);
        };
        
        console.log('Enhanced UploadThing input for mobile choice:', fileInput);
      }
    }
  }, []);

  const handleSourceChoice = (useCamera: boolean) => {
    setShowSourceChoice(false);
    
    if (uploadButtonRef.current) {
      const fileInput = uploadButtonRef.current.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (fileInput) {
        if (useCamera) {
          fileInput.setAttribute('capture', 'environment');
        } else {
          fileInput.removeAttribute('capture');
        }
        
        // Trigger the native file picker
        fileInput.click();
      }
    }
  };

  return (
    <div ref={uploadButtonRef} className="w-full max-w-md mx-auto">
      {/* Source choice modal */}
      {showSourceChoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4 text-center">Choose Image Source</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleSourceChoice(true)}
                className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700 font-medium"
              >
                📷 Take Photo
              </button>
              <button
                onClick={() => handleSourceChoice(false)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
              >
                📁 Choose from Files
              </button>
              <button
                onClick={() => setShowSourceChoice(false)}
                className="w-full p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}