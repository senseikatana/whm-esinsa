export interface OAuthCredentials {
	clientId: string;
	clientSecret: string;
}

export interface OAuthProviders {
	google: OAuthCredentials | null;
	github: OAuthCredentials | null;
}

function pair(idName: string, secretName: string): OAuthCredentials | null {
	const clientId = process.env[idName];
	const clientSecret = process.env[secretName];
	return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** OAuth providers that have a complete id/secret pair. */
export function getOAuthProviders(): OAuthProviders {
	return {
		google: pair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
		github: pair("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"),
	};
}

/** Public sign-up can be disabled in production with DISABLE_PUBLIC_SIGNUP=true. */
export function publicSignupEnabled(): boolean {
	return process.env.DISABLE_PUBLIC_SIGNUP !== "true";
}

export function trustedOrigins(): string[] {
	return (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
}

export interface EnvReport {
	errors: string[];
	warnings: string[];
}

/** Non-throwing validation used by `nub run env:check` and docs. */
export function validateEnv(): EnvReport {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!process.env.DATABASE_URL) {
		errors.push("DATABASE_URL is missing (Neon connection string).");
	}

	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret) {
		errors.push("BETTER_AUTH_SECRET is missing.");
	} else if (secret.length < 32) {
		errors.push("BETTER_AUTH_SECRET must be at least 32 characters.");
	}

	if (!process.env.BETTER_AUTH_URL) {
		errors.push("BETTER_AUTH_URL is missing (e.g. http://localhost:3000).");
	}

	for (const [name, idName, secretName] of [
		["Google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
		["GitHub", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
	] as const) {
		const hasId = Boolean(process.env[idName]);
		const hasSecret = Boolean(process.env[secretName]);
		if (hasId !== hasSecret) {
			errors.push(`${name} OAuth is half configured: set both ${idName} and ${secretName}.`);
		}
		if (!hasId && !hasSecret) {
			warnings.push(`${name} OAuth is not configured (button will stay disabled).`);
		}
	}

	if (process.env.NODE_ENV === "production" && process.env.BETTER_AUTH_URL?.startsWith("http://")) {
		warnings.push("BETTER_AUTH_URL uses http:// in production.");
	}

	return { errors, warnings };
}
