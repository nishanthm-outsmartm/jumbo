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


  firebase: {
        API_KEY: "",
        APP_ID: "",
        PROJECT_ID: "-",
        privateKey: "-----BEGIN PRIVATE KEY-----",
        clientEmail: "",
     }, 
  },
  loadingScreenTimeout: 100,
};

export default config;
