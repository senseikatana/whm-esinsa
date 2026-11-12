/**
 * basePath utility.
 *
 * With subdomain deployment (whm.senseikatana.com), no prefix is needed.
 * The app is served at root of the subdomain.
 *
 * If ever needed for subpath deployment, add prefixes to KNOWN_PREFIXES.
 */

const KNOWN_PREFIXES: string[] = [];

let cached: string | null = null;

export function getBasePath(): string {
	if (cached !== null) return cached;

	if (typeof window === "undefined") {
		cached = "";
		return cached;
	}

	const pathname = window.location.pathname;
	for (const prefix of KNOWN_PREFIXES) {
		if (pathname.startsWith(prefix)) {
			cached = prefix;
			return cached;
		}
	}

	cached = "";
	return cached;
}

export function withBasePath(path: string): string {
	const base = getBasePath();
	if (!base) return path;
	return `${base}${path}`;
}
