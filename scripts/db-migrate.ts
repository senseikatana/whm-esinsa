import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getPool } from "../app/lib/db";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
	// DDL goes through the direct endpoint; the pooler is for application traffic.
	if (process.env.DATABASE_URL_UNPOOLED) {
		process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
	}

	const pool = getPool();
	const client = await pool.connect();

	try {
		// Prevent two concurrent migrate runs from racing.
		await client.query("SELECT pg_advisory_lock(hashtext('whm_schema_migrations'))");

		await client.query(`
			CREATE TABLE IF NOT EXISTS schema_migrations (
				name TEXT PRIMARY KEY,
				applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)
		`);

		const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith(".sql")).sort();

		for (const file of files) {
			const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
			if (applied.rowCount) {
				console.log(`skip  ${file}`);
				continue;
			}

			const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
			try {
				await client.query("BEGIN");
				await client.query(sql);
				await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
				await client.query("COMMIT");
				console.log(`apply ${file}`);
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			}
		}
	} finally {
		await client.query("SELECT pg_advisory_unlock(hashtext('whm_schema_migrations'))").catch(() => {});
		client.release();
		await pool.end();
	}

	console.log("Migrations ready.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
