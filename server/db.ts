// import { Pool, neonConfig } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-serverless";
// import ws from "ws";
// import * as schema from "@shared/schema";
// import { serverConfig } from "@shared/config/server.config";

// neonConfig.webSocketConstructor = ws;


// export const pool = new Pool({ connectionString: serverConfig.env.databaseUrl });
// export const db = drizzle({ client: pool, schema });

import { Pool } from "pg"; // standard Postgres client
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { serverConfig } from "@shared/config/server.config";

// Create a standard Postgres connection pool
export const pool = new Pool({
    connectionString: serverConfig.env.databaseUrl,
});

// Initialize Drizzle ORM with pg pool
export const db = drizzle(pool, { schema });
