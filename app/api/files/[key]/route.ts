import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/api-auth";
import { db } from "../../../lib/drizzle";
import { INLINE_SAFE_TYPES } from "../../../lib/file-limits";
import { files } from "../../../lib/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
	try {
		const user = await getSessionUser();
		if (!user)
			return NextResponse.json({ success: false, error: "Sesión requerida" }, { status: 401 });

		const { key } = await params;
		const [file] = await db
			.select({ content_type: files.content_type, data: files.data })
			.from(files)
			.where(eq(files.key, key))
			.limit(1);

		if (!file) {
			return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
		}

		// Never render attacker-controlled HTML on the app origin.
		const inline = INLINE_SAFE_TYPES.has(file.content_type);
		const contentType = inline ? file.content_type : "application/octet-stream";

		return new Response(new Uint8Array(file.data), {
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `${inline ? "inline" : "attachment"}; filename="file"`,
				"X-Content-Type-Options": "nosniff",
				"Cache-Control": "private, max-age=3600",
			},
		});
	} catch (err: unknown) {
		console.error("[api/files]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ key: string }> }) {
	try {
		const user = await getSessionUser();
		if (!user)
			return NextResponse.json({ success: false, error: "Sesión requerida" }, { status: 401 });
		if (user.role === "viewer") {
			return NextResponse.json({ success: false, error: "Rol de solo lectura" }, { status: 403 });
		}

		const { key } = await params;
		const ownership =
			user.role === "admin"
				? eq(files.key, key)
				: and(eq(files.key, key), eq(files.uploaded_by, user.id));

		const deleted = await db.delete(files).where(ownership).returning({ key: files.key });

		if (deleted.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Archivo no encontrado o sin permisos" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		console.error("[api/files]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}
