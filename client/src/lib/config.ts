const config = {
  env: {
    databaseUrl:
      "postgresql://neondb_owner:npg_2zLrK9xmFaiH@ep-polished-meadow-abh0te9j-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
    FRONTEND_URL: "http://localhost:3000",
    // SMTP Configuration
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: 587,
    SMTP_USER: "stapprabhu10@gmail.com",
    SMTP_PASS: "bmgp zlnb svbi dftu",
    SMTP_FROM: "stapprabhu10@gmail.com",
    SMTP_FROM_NAME: "Jumbo Jolt",
    SMTP_TLS: false,

    // minio: {
    //   bucketName: process.env.MINIO_BUCKET_NAME || "course-content",
    //   endpoint: process.env.MINIO_ENDPOINT || "localhost",
    //   port: parseInt(process.env.MINIO_PORT || "9000"),
    //   useSSL: process.env.MINIO_USE_SSL === "false",
    //   accessKey: process.env.MINIO_ACCESS_KEY!,
    //   secretKey: process.env.MINIO_SECRET_KEY!,
    // },
  },
  loadingScreenTimeout: 100,
};

export default config;
