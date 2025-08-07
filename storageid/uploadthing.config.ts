import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(async ({ metadata, file }) => {
    console.log("✅ Upload complete:", file);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
