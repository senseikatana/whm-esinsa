import type { BetterAuthOptions } from "better-auth";
import { pool } from "./db";

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

export function configuredProviders(): { google: boolean; github: boolean } {
	return { google: googleConfigured, github: githubConfigured };
}

/** Shared Better Auth options for the Next handler and server-side scripts. */
export function authOptions(): BetterAuthOptions {
	return {
		database: pool,
		baseURL: process.env.BETTER_AUTH_URL,
		secret: process.env.BETTER_AUTH_SECRET,
		trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
			.split(",")
			.map((origin) => origin.trim())
			.filter(Boolean),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 6,
			autoSignIn: true,
		},
		socialProviders: {
			...(googleConfigured
				? {
						google: {
							clientId: process.env.GOOGLE_CLIENT_ID as string,
							clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
						},
					}
				: {}),
			...(githubConfigured
				? {
						github: {
							clientId: process.env.GITHUB_CLIENT_ID as string,
							clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
						},
					}
				: {}),
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
