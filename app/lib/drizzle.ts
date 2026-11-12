import { drizzle } from "drizzle-orm/node-postgres";
import { getPool } from "./db";
import * as schema from "./schema";

/**
 * Drizzle client shared by server code.
 * Constructing it does not open a connection; the pool connects on first query.
 */
export const db = drizzle(getPool(), { schema });

export type Database = typeof db;
