// /uploadthing.config.ts
import { createUploadthing, FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const OurFileRouter = {
  imageUploader: f({ 
    image: { 
      maxFileSize: '4MB',
      // Optional: be more specific about allowed types
      // This helps with MIME type validation
      maxFileCount: 1
    } 
  })
  .middleware(async ({ req, files }) => {
    // Log file info during middleware phase
    console.log('🔍 Middleware - Files:', files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type // This is the MIME type from the client
    })))
    
    return {}
  })
  .onUploadError((error) => {
    console.log('❌ Upload failed:', error);
    console.log('Error details:', {
      message: error
      
    })
  })
 .onUploadComplete(async ({ file, metadata }) => {
  const fileUrl = `https://utfs.io/f/${file.key}`; // safe & future-proof

  console.log('✅ Upload complete:', {
    name: file.name,
    size: file.size,
    url: fileUrl,
    key: file.key,
    type: file.type // Server-validated MIME type
  });

  return { fileUrl };
})
} satisfies FileRouter;

export type OurFileRouter = typeof OurFileRouter;