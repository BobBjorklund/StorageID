export const runtime = 'edge';

import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/next';

const f = createUploadthing();

const router = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .onUploadComplete(async ({ file }) => {
      console.log('✅ Upload complete:', file);
    }),
} satisfies FileRouter;

const handlers = createRouteHandler({ router });

console.log('🧪 GET is', typeof handlers.GET);  // should be "function"
console.log('🧪 POST is', typeof handlers.POST); // should be "function"

export const { GET, POST } = handlers;
