import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../app/lib/db";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			name TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`);

	const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith(".sql")).sort();

	for (const file of files) {
		const applied = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
		if (applied.rowCount) {
			console.log(`skip  ${file}`);
			continue;
		}

		const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(sql);
			await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
			await client.query("COMMIT");
			console.log(`apply ${file}`);
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	await pool.end();
	console.log("Migrations ready.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
