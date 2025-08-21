import { defineConfig } from "drizzle-kit";
import config from "./client/src/lib/config";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.env.databaseUrl,
  },
});
