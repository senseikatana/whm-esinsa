import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/api-auth";
import { pool } from "../../../lib/db";
import { INLINE_SAFE_TYPES } from "../../../lib/file-limits";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
	try {
		const user = await getSessionUser();
		if (!user)
			return NextResponse.json({ success: false, error: "Sesión requerida" }, { status: 401 });

		const { key } = await params;
		const { rows } = await pool.query("SELECT content_type, data FROM files WHERE key = $1 LIMIT 1", [
			key,
		]);
		const file = rows[0];
		if (!file) {
			return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
		}

		// Never render attacker-controlled HTML on the app origin.
		const inline = INLINE_SAFE_TYPES.has(file.content_type);
		const contentType = inline ? file.content_type : "application/octet-stream";

		return new Response(file.data, {
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
		const { rowCount } = await pool.query(
			"DELETE FROM files WHERE key = $1 AND (uploaded_by = $2 OR $3 = 'admin')",
			[key, user.id, user.role],
		);

		if (!rowCount) {
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
