import { NextResponse } from "next/server";

/** Reports which OAuth providers have credentials configured server-side. */
export async function GET() {
	return NextResponse.json({
		google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
		github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
	});
}
