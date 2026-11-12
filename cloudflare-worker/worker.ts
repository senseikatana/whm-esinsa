/**
 * Cloudflare Worker — Reverse Proxy
 *
 * whm.senseikatana.com/* → Proxy a InsForge (WarehouseFlow SGA)
 *
 * Con subdominio no hace falta strip de prefijo ni basePath.
 * El Worker simplemente proxya todo al upstream.
 */

interface Env {
	[key: string]: string;
}

const UPSTREAM = "https://8cc79ec9.insforge.site";

const REDIRECT_STATUSES: readonly number[] = [301, 302, 303, 307, 308];

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const upstreamUrl = new URL(url.pathname + url.search, UPSTREAM);

		const headers = new Headers(request.headers);
		headers.set("Host", upstreamUrl.host);
		headers.set("X-Forwarded-Host", url.host);
		headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

		try {
			const response = await fetch(
				new Request(upstreamUrl.toString(), {
					method: request.method,
					headers,
					body: request.body,
					redirect: "manual",
				}),
			);

			// Rewrite redirects to stay on subdomain
			if (REDIRECT_STATUSES.includes(response.status)) {
				const location = response.headers.get("Location");
				if (location) {
					const newHeaders = new Headers(response.headers);
					try {
						const redirectUrl = new URL(location, upstreamUrl);
						if (redirectUrl.host === upstreamUrl.host) {
							newHeaders.set("Location", `${url.origin}${redirectUrl.pathname}${redirectUrl.search}`);
						}
					} catch {
						if (location.startsWith("/")) {
							newHeaders.set("Location", `${url.origin}${location}`);
						}
					}
					return new Response(response.body, {
						status: response.status,
						statusText: response.statusText,
						headers: newHeaders,
					});
				}
			}

			return response;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			return new Response(`Proxy Error: ${message}`, { status: 502 });
		}
	},
};
