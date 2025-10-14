import { defineConfig } from "drizzle-kit";
import { serverConfig as config } from "./shared/config/server.config";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.env.databaseUrl,
  },
});
