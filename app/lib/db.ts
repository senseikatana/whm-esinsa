import { Pool, type QueryResultRow } from "pg";

/**
 * Single Postgres pool for the whole server process.
 *
 * Cached on globalThis so Next.js dev hot-reloads do not leak connections.
 * `pg` reads sslmode from DATABASE_URL (Neon requires TLS).
 */
const globalForDb = globalThis as unknown as { __whmPool?: Pool };

function createPool(): Pool {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error(
			"DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
		);
	}

	return new Pool({
		connectionString,
		max: 5,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
	});
}

export const pool: Pool = globalForDb.__whmPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
	globalForDb.__whmPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
	text: string,
	params: unknown[] = [],
): Promise<T[]> {
	const result = await pool.query<T>(text, params);
	return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
	text: string,
	params: unknown[] = [],
): Promise<T | null> {
	const rows = await query<T>(text, params);
	return rows[0] ?? null;
}
