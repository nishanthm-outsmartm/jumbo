import { serverConfig } from "@shared/config/server.config";
import { Client } from "minio";


const minioClient = new Client({
  endPoint: serverConfig.env.minio.endpoint, // Change if MinIO is on a different host
  useSSL: serverConfig.env.minio.useSSL, // Set to true if you're using SSL
  accessKey: serverConfig.env.minio.accessKey, // Default MinIO access key
  secretKey: serverConfig.env.minio.secretKey, // Default MinIO secret key
});

export default minioClient;
