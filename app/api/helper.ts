import { NextResponse } from "next/server";
import { deleteRowById, insertRow, listRows, updateRowById } from "../lib/repositories/crud";
import { assertTable } from "../lib/tables";

function fail(err: unknown) {
	console.error("[api]", err);
	return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
}

export async function handleGet(table: string) {
	try {
		const safeTable = assertTable(table);
		const items = await listRows(safeTable, { limit: 500 });
		return NextResponse.json({ success: true, data: { items } });
	} catch (err: unknown) {
		return fail(err);
	}
}

export async function handlePost(table: string, request: Request) {
	try {
		const safeTable = assertTable(table);
		const body = await request.json();
		const row = await insertRow(safeTable, body);
		return NextResponse.json({ success: true, data: row });
	} catch (err: unknown) {
		return fail(err);
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
		const row = await updateRowById(safeTable, numericId, body);
		if (!row) {
			return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: row });
	} catch (err: unknown) {
		return fail(err);
	}
}

export async function handleDelete(table: string, id: string) {
	try {
		const safeTable = assertTable(table);
		const numericId = Number(id);
		if (!Number.isInteger(numericId) || numericId <= 0) {
			return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
		}

		const deleted = await deleteRowById(safeTable, numericId);
		if (deleted === 0) {
			return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		return fail(err);
	}
}
