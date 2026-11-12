import { getPool } from "../app/lib/db";
import { getOAuthProviders, validateEnv } from "../app/lib/env";

async function main() {
	const { errors, warnings } = validateEnv();

	console.log("Environment check\n");

	for (const error of errors) console.log(`  ✗ ${error}`);
	for (const warning of warnings) console.log(`  ! ${warning}`);
	if (errors.length === 0) console.log("  ✓ required variables are set");

	const providers = getOAuthProviders();
	console.log(
		`  · OAuth: google=${providers.google ? "on" : "off"} github=${providers.github ? "on" : "off"}`,
	);

	if (!process.env.DATABASE_URL) {
		console.log("\n✗ Cannot test the database without DATABASE_URL.");
		process.exit(1);
	}

	const pool = getPool();
	try {
		const { rows } = await pool.query<{ db: string }>("SELECT current_database() AS db");
		console.log(`\n  ✓ database reachable: ${rows[0]?.db}`);

		const { rows: tables } = await pool.query<{
			products: string | null;
			users: string | null;
			migrations: string | null;
		}>(
			`SELECT
				to_regclass($1)::text AS products,
				to_regclass($2)::text AS users,
				to_regclass($3)::text AS migrations`,
			["public.products", 'public."user"', "public.schema_migrations"],
		);

		const missing = Object.entries(tables[0] ?? {})
			.filter(([, value]) => !value)
			.map(([key]) => key);

		if (missing.length > 0) {
			console.log(`  ! missing tables: ${missing.join(", ")}`);
			console.log("    run: nub run db:setup");
		} else {
			console.log("  ✓ schema present (products, user, schema_migrations)");
		}
	} catch (error) {
		console.log(
			`\n✗ database connection failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exitCode = 1;
	} finally {
		await pool.end().catch(() => {});
	}

	if (errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
