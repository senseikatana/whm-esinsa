import { NextResponse } from "next/server";
import { getOAuthProviders } from "../../lib/env";

/** Reports which OAuth providers have credentials configured server-side. */
export async function GET() {
	const providers = getOAuthProviders();
	return NextResponse.json({
		google: Boolean(providers.google),
		github: Boolean(providers.github),
	});
}
