import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit is used for local schema inspection/introspection and future
 * migration generation. The applied schema baseline lives in db/migrations.
 */
export default defineConfig({
	dialect: "postgresql",
	schema: "./app/lib/schema.ts",
	out: "./db/drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
	strict: true,
	verbose: false,
});
