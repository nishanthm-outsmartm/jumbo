import minioClient from "./bucketConfig";
import { randomUUID } from "crypto";
import { serverConfig as config } from "@shared/config/server.config";



export async function uploadImage(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bucketName = config.env.minio.bucketName;
    const objectName = `${config.env.minio.objectName}/${randomUUID()}-${file.name
      }`;

    console.log("Uploading file:", objectName);
    console.log("Bucket name:", bucketName);
    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = fileBuffer.length;

    // Ensure the bucket exists and is fully public
    const bucketExists = await minioClient.bucketExists(bucketName);

    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Set bucket policy to permanently public
    await minioClient.setBucketPolicy(
      bucketName,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      })
    );

    // Upload file with public read access
    await minioClient.putObject(bucketName, objectName, fileBuffer, fileSize, {
      "Content-Type": file.type,
      "x-amz-acl": "public-read",
    });

    // Generate a permanent public URL
    const publicUrl = `${config.env.minio.endpoint}/${bucketName}/${objectName}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("MinIO Upload Error:", error);
    return { success: false, error: (error as Error).message };
  }
}
