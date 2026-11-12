import { Pool, type QueryResultRow } from "pg";

/**
 * Single Postgres pool for the whole server process.
 *
 * The pool is created lazily and cached on globalThis so Next.js dev
 * hot-reloads do not leak connections. Constructing it does not open a
 * socket, which keeps `next build` working without database credentials;
 * `query()` and `getPool()` validate the env when they are actually used.
 */
const globalForDb = globalThis as unknown as { __whmPool?: Pool };

export function getPool(): Pool {
	if (globalForDb.__whmPool) return globalForDb.__whmPool;

	globalForDb.__whmPool = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 5,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
	});

	return globalForDb.__whmPool;
}

function assertDatabaseUrl(): void {
	if (!process.env.DATABASE_URL) {
		throw new Error(
			"DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
		);
	}
}

export async function query<T extends QueryResultRow = QueryResultRow>(
	text: string,
	params: unknown[] = [],
): Promise<T[]> {
	assertDatabaseUrl();
	const result = await getPool().query<T>(text, params);
	return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
	text: string,
	params: unknown[] = [],
): Promise<T | null> {
	const rows = await query<T>(text, params);
	return rows[0] ?? null;
}
