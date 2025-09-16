import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { serverConfig } from "@shared/config/server.config";

neonConfig.webSocketConstructor = ws;


export const pool = new Pool({ connectionString: serverConfig.env.databaseUrl });
export const db = drizzle({ client: pool, schema });
