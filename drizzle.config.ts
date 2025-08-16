import { defineConfig } from "drizzle-kit";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_2zLrK9xmFaiH@ep-wispy-unit-abhedjdj-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
