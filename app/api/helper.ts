import { NextResponse } from "next/server";
import { pool } from "../lib/db";
import { assertTable, pickColumns } from "../lib/table-columns";

export async function handleGet(table: string) {
	try {
		const safeTable = assertTable(table);
		const { rows } = await pool.query(`SELECT * FROM ${safeTable} ORDER BY id ASC LIMIT 500`);
		return NextResponse.json({ success: true, data: { items: rows } });
	} catch (err: unknown) {
		console.error("[api]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}

export async function handlePost(table: string, request: Request) {
	try {
		const safeTable = assertTable(table);
		const body = await request.json();
		const values = pickColumns(safeTable, body);
		const columns = Object.keys(values);

		if (columns.length === 0) {
			return NextResponse.json({ success: false, error: "Sin datos para insertar" }, { status: 400 });
		}

		const placeholders = columns.map((_, index) => `$${index + 1}`);
		const { rows } = await pool.query(
			`INSERT INTO ${safeTable} (${columns.join(", ")})
			 VALUES (${placeholders.join(", ")})
			 RETURNING *`,
			Object.values(values),
		);

		return NextResponse.json({ success: true, data: rows[0] ?? null });
	} catch (err: unknown) {
		console.error("[api]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}

export async function handlePut(table: string, id: string, request: Request) {
	try {
		const safeTable = assertTable(table);
		const numericId = Number(id);
		if (!Number.isInteger(numericId) || numericId <= 0) {
			return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
		}

		const body = await request.json();
		const values = pickColumns(safeTable, body);
		const columns = Object.keys(values);

		if (columns.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Sin datos para actualizar" },
				{ status: 400 },
			);
		}

		const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
		const { rows } = await pool.query(
			`UPDATE ${safeTable}
			 SET ${assignments.join(", ")}
			 WHERE id = $${columns.length + 1}
			 RETURNING *`,
			[...Object.values(values), numericId],
		);

		if (rows.length === 0) {
			return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: rows[0] ?? null });
	} catch (err: unknown) {
		console.error("[api]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}

export async function handleDelete(table: string, id: string) {
	try {
		const safeTable = assertTable(table);
		const numericId = Number(id);
		if (!Number.isInteger(numericId) || numericId <= 0) {
			return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
		}

		await pool.query(`DELETE FROM ${safeTable} WHERE id = $1`, [numericId]);
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		console.error("[api]", err);
		return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
	}
}
