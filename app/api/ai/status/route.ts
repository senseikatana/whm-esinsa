import { NextResponse } from "next/server";
import { withAuth } from "../../../lib/api-auth";

interface StatusPayload {
	provider: "FreeLLMAPI";
	configured: boolean;
	valid: boolean;
	reachable: boolean;
	status?: number;
}

const CACHE_MS = 30_000;
let cache: { at: number; payload: StatusPayload } | null = null;

/** Reports FreeLLMAPI configuration and validates the key (cached 30s). */
export const GET = withAuth(async () => {
	const apiKey = process.env.FREELLM_GATEWAY_KEY;
	const baseUrl = (process.env.FREELLM_GATEWAY_URL || "http://127.0.0.1:31415/v1").replace(
		/\/+$/,
		"",
	);

	if (!apiKey) {
		return NextResponse.json<StatusPayload>({
			provider: "FreeLLMAPI",
			configured: false,
			valid: false,
			reachable: false,
		});
	}

	if (cache && Date.now() - cache.at < CACHE_MS) {
		return NextResponse.json(cache.payload);
	}

	try {
		const response = await fetch(`${baseUrl}/models?available=true`, {
			headers: { Authorization: `Bearer ${apiKey}` },
			signal: AbortSignal.timeout(5_000),
		});

		const payload: StatusPayload = {
			provider: "FreeLLMAPI",
			configured: true,
			valid: response.ok,
			reachable: true,
			status: response.status,
		};

		cache = { at: Date.now(), payload };
		return NextResponse.json(payload);
	} catch {
		const payload: StatusPayload = {
			provider: "FreeLLMAPI",
			configured: true,
			valid: false,
			reachable: false,
		};
		cache = { at: Date.now(), payload };
		return NextResponse.json(payload);
	}
});
