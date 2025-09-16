import dotenv from 'dotenv';
dotenv.config();

export const serverConfig = {
    env: {
        port: 3006,
        databaseUrl:
            process.env.VITE_DATABASE_URL!,
        frontendUrl: process.env.VITE_FRONTEND_URL,
        apiBaseUrl: process.env.VITE_API_BASE_URL,
        smtp: {
            host: process.env.VITE_SMTP_HOST!,
            port: process.env.VITE_SMTP_PORT!,
            user: process.env.VITE_SMTP_USER!,
            pass: process.env.VITE_SMTP_PASS!,
            from: process.env.VITE_SMTP_FROM!,
            fromName: process.env.VITE_SMTP_FROM_NAME!,
            tls: process.env.VITE_SMTP_TLS === 'true',
        },

        firebase: {
            projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
            privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY!,
            clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL!,
        },

        minio: {
            bucketName: process.env.VITE_MINIO_BUCKET_NAME!,
            objectName: process.env.VITE_MINIO_OBJECT_NAME!,
            endpoint: process.env.VITE_MINIO_ENDPOINT!,
            ...(process.env.VITE_MINIO_PORT && { port: process.env.VITE_MINIO_PORT }),
            useSSL: process.env.VITE_MINIO_USESSL === 'true',
            accessKey: process.env.VITE_MINIO_ACCESS_KEY!,
            secretKey: process.env.VITE_MINIO_SECRET_KEY!,
        },
    },
    loadingScreenTimeout: 100,
};
