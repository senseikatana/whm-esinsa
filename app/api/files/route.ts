import { NextResponse } from "next/server";
import { getSessionUser } from "../../lib/api-auth";
import { pool } from "../../lib/db";
import { MAX_FILE_BYTES } from "../../lib/file-limits";

function sanitizeName(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/-{2,}/g, "-")
		.slice(-80);
}

export async function POST(request: Request) {
	try {
		const user = await getSessionUser();
		if (!user)
			return NextResponse.json({ success: false, error: "Sesión requerida" }, { status: 401 });
		if (user.role === "viewer") {
			return NextResponse.json({ success: false, error: "Rol de solo lectura" }, { status: 403 });
		}

		const declaredSize = Number(request.headers.get("content-length") ?? 0);
		if (declaredSize > MAX_FILE_BYTES + 8 * 1024) {
			return NextResponse.json(
				{ success: false, error: "El archivo supera el límite de 5 MB" },
				{ status: 413 },
			);
		}

		const form = await request.formData();
		const file = form.get("file");

		if (!(file instanceof File)) {
			return NextResponse.json({ success: false, error: "Archivo inválido" }, { status: 400 });
		}
		if (file.size === 0) {
			return NextResponse.json({ success: false, error: "El archivo está vacío" }, { status: 400 });
		}
		if (file.size > MAX_FILE_BYTES) {
			return NextResponse.json(
				{ success: false, error: "El archivo supera el límite de 5 MB" },
				{ status: 413 },
			);
		}

		// Keys are always server-generated: clients cannot overwrite existing files.
		const key = `${user.id}/${crypto.randomUUID()}-${sanitizeName(file.name || "file")}`;
		const data = Buffer.from(await file.arrayBuffer());

		await pool.query(
			`INSERT INTO files (key, content_type, size, data, uploaded_by)
			 VALUES ($1, $2, $3, $4, $5)`,
			[key, file.type || "application/octet-stream", file.size, data, user.id],
		);

		return NextResponse.json({
			success: true,
			data: { key, url: `/api/files/${encodeURI(key)}` },
		});
	} catch (err: unknown) {
		console.error("[api/files]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}
