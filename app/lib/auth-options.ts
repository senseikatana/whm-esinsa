import type { BetterAuthOptions } from "better-auth";
import { getPool } from "./db";
import { getOAuthProviders, publicSignupEnabled, trustedOrigins } from "./env";

/** Shared Better Auth options for the Next handler and server-side scripts. */
export function authOptions(): BetterAuthOptions {
	const providers = getOAuthProviders();

	return {
		// Better Auth's Kysely adapter accepts a node-postgres Pool directly.
		database: getPool(),
		baseURL: process.env.BETTER_AUTH_URL,
		secret: process.env.BETTER_AUTH_SECRET,
		trustedOrigins: trustedOrigins(),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 8,
			autoSignIn: true,
			disableSignUp: !publicSignupEnabled(),
		},
		socialProviders: {
			...(providers.google ? { google: providers.google } : {}),
			...(providers.github ? { github: providers.github } : {}),
		},
		user: {
			additionalFields: {
				role: {
					type: "string",
					required: false,
					defaultValue: "viewer",
					input: false,
				},
				zone: { type: "string", required: false, defaultValue: "", input: false },
				phone: { type: "string", required: false, defaultValue: "", input: false },
				isActive: { type: "boolean", required: false, defaultValue: true, input: false },
			},
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
		},
	};
}
