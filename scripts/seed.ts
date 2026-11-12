import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { betterAuth } from "better-auth";
import { authOptions } from "../app/lib/auth-options";
import { pool } from "../app/lib/db";
import { SEED_ACCOUNTS } from "../app/lib/seeds/accounts";

const SEEDS_DIR = path.join(process.cwd(), "db", "seeds");

async function runSeedSql() {
	const files = (await readdir(SEEDS_DIR)).filter((file) => file.endsWith(".sql")).sort();

	for (const file of files) {
		const sql = await readFile(path.join(SEEDS_DIR, file), "utf8");
		await pool.query(sql);
		console.log(`seed  ${file}`);
	}
}

async function seedAccounts() {
	const seedAuth = betterAuth(authOptions());

	for (const account of SEED_ACCOUNTS) {
		const existing = await pool.query('SELECT id FROM "user" WHERE lower(email) = lower($1)', [
			account.email,
		]);

		if (!existing.rowCount) {
			const result = await seedAuth.api.signUpEmail({
				body: {
					email: account.email,
					password: account.password,
					name: account.name,
				},
			});

			if (!result?.user) {
				throw new Error(`No se pudo crear el usuario ${account.email}`);
			}
			console.log(`user  ${account.email} (created)`);
		} else {
			console.log(`user  ${account.email} (exists)`);
		}

		await pool.query(
			'UPDATE "user" SET role = $1, zone = $2, phone = $3, "isActive" = true, "emailVerified" = true WHERE lower(email) = lower($4)',
			[account.role, account.zone, account.phone, account.email],
		);
	}
}

async function main() {
	await runSeedSql();
	await seedAccounts();
	await pool.end();
	console.log("Seed ready.");
}

main().catch(async (error) => {
	console.error(error);
	await pool.end().catch(() => {});
	process.exit(1);
});
