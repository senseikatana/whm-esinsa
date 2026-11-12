import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

export type AppRole = "admin" | "manager" | "supervisor" | "operator" | "picker" | "viewer";

export const APP_ROLES: readonly AppRole[] = [
	"admin",
	"manager",
	"supervisor",
	"operator",
	"picker",
	"viewer",
];

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: AppRole;
}

/** Server-side session lookup. Returns null when not authenticated or inactive. */
export async function getSessionUser(): Promise<SessionUser | null> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return null;

	const user = session.user as typeof session.user & { role?: string; isActive?: boolean };

	// Fail closed: an unknown role or a deactivated account gets no access.
	const role = user.role as AppRole | undefined;
	if (!role || !APP_ROLES.includes(role)) return null;
	if (user.isActive === false) return null;

	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role,
	};
}

export class HttpError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "HttpError";
	}
}

export function errorResponse(error: unknown): NextResponse {
	if (error instanceof HttpError) {
		return NextResponse.json({ success: false, error: error.message }, { status: error.status });
	}

	console.error("[api]", error);
	return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
}

/** Requires an authenticated session. `roles` optionally narrows access. */
export function withAuth<F extends (...args: any[]) => Promise<Response>>(
	handler: F,
	roles?: AppRole[],
): F {
	const wrapped = async (...args: any[]): Promise<Response> => {
		try {
			const user = await getSessionUser();
			if (!user) throw new HttpError(401, "Sesión requerida");
			if (roles && !roles.includes(user.role)) {
				throw new HttpError(403, "No tenés permisos para esta acción");
			}
			return await handler(...args);
		} catch (error) {
			return errorResponse(error);
		}
	};

	return wrapped as F;
}

/** Requires a session and rejects the read-only `viewer` role. */
export function withWriteAuth<F extends (...args: any[]) => Promise<Response>>(handler: F): F {
	return withAuth(handler, ["admin", "manager", "supervisor", "operator", "picker"]);
}
