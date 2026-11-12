import { and, asc, count, eq, getTableColumns, ilike, inArray, lte, or } from "drizzle-orm";
import { db } from "../drizzle";
import { customers, orders, picking, products, staff, userProfiles } from "../schema";
import { getTable, pickColumns, type TableName } from "../tables";

export interface ListOptions {
	limit?: number;
	offset?: number;
	orderBy?: string;
	filters?: Record<string, unknown>;
	search?: { term?: string | null; columns: string[] };
}

function clampLimit(limit?: number): number | null {
	if (!limit || !Number.isFinite(limit)) return null;
	return Math.min(Math.max(Math.trunc(limit), 1), 500);
}

/** List rows from a WMS table with allowlisted filters and optional ILIKE search. */
export async function listRows(
	tableName: TableName,
	options: ListOptions = {},
): Promise<Record<string, unknown>[]> {
	// Table is selected from an allowlisted map; the cast keeps a single generic path.
	const table = getTable(tableName) as any;
	const columns = getTableColumns(table) as Record<string, any>;
	const conditions: any[] = [];

	for (const [key, value] of Object.entries(options.filters ?? {})) {
		if (value === undefined || value === null || value === "") continue;
		const column = columns[key];
		if (!column) continue;
		conditions.push(eq(column, value));
	}

	const term = options.search?.term?.trim();
	if (term) {
		const pattern = `%${term}%`;
		const matches = (options.search?.columns ?? [])
			.map((name) => columns[name])
			.filter(Boolean)
			.map((column) => ilike(column, pattern));
		if (matches.length > 0) conditions.push(or(...matches));
	}

	let request = db.select().from(table).$dynamic();
	if (conditions.length > 0) request = request.where(and(...conditions));
	const orderColumn =
		options.orderBy && columns[options.orderBy] ? columns[options.orderBy] : columns.id;
	request = request.orderBy(asc(orderColumn));

	const limit = clampLimit(options.limit);
	if (limit) request = request.limit(limit);
	if (options.offset && options.offset > 0) request = request.offset(Math.trunc(options.offset));

	return (await request) as Record<string, unknown>[];
}

export async function getBySlug(
	tableName: TableName,
	slug: string,
): Promise<Record<string, unknown> | null> {
	const table = getTable(tableName) as any;
	const [row] = await db.select().from(table).where(eq(table.slug, slug)).limit(1);
	return row ?? null;
}

export async function insertRow(
	tableName: TableName,
	input: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
	const values = pickColumns(tableName, input);
	if (Object.keys(values).length === 0) throw new Error("Sin datos para insertar");

	const table = getTable(tableName) as any;
	const rows = (await db
		.insert(table)
		.values(values as any)
		.returning()) as Record<string, unknown>[];
	return rows[0] ?? null;
}

export async function updateRowBySlug(
	tableName: TableName,
	slug: string,
	input: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
	const values = pickColumns(tableName, input);
	if (Object.keys(values).length === 0) throw new Error("Sin datos para actualizar");

	const table = getTable(tableName) as any;
	const rows = (await db
		.update(table)
		.set(values as any)
		.where(eq(table.slug, slug))
		.returning()) as Record<string, unknown>[];
	return rows[0] ?? null;
}

export async function deleteRowBySlug(tableName: TableName, slug: string): Promise<boolean> {
	const table = getTable(tableName) as any;
	await db.delete(table).where(eq(table.slug, slug));
	return true;
}

export async function deleteRowsBySlugs(tableName: TableName, slugs: string[]): Promise<boolean> {
	if (slugs.length === 0) return true;
	const table = getTable(tableName) as any;
	await db.delete(table).where(inArray(table.slug, slugs));
	return true;
}

export async function getById(
	tableName: TableName,
	id: number,
): Promise<Record<string, unknown> | null> {
	const table = getTable(tableName) as any;
	const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
	return row ?? null;
}

export async function updateRowById(
	tableName: TableName,
	id: number,
	input: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
	const values = pickColumns(tableName, input);
	if (Object.keys(values).length === 0) throw new Error("Sin datos para actualizar");

	const table = getTable(tableName) as any;
	const rows = (await db
		.update(table)
		.set(values as any)
		.where(eq(table.id, id))
		.returning()) as Record<string, unknown>[];
	return rows[0] ?? null;
}

export async function deleteRowById(tableName: TableName, id: number): Promise<number> {
	const table = getTable(tableName) as any;
	const deleted = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
	return deleted.length;
}

export async function deleteRowsByIds(tableName: TableName, ids: number[]): Promise<void> {
	if (ids.length === 0) return;
	const table = getTable(tableName) as any;
	await db.delete(table).where(inArray(table.id, ids));
}

/** Dashboard counters computed in the database. */
export async function dashboardStats() {
	const [productRows, orderRows, customerRows, staffRows, criticalRows, pendingRows, pickingRows] =
		await Promise.all([
			db.select({ value: count() }).from(products),
			db.select({ value: count() }).from(orders),
			db.select({ value: count() }).from(customers),
			db.select({ value: count() }).from(staff),
			db.select({ value: count() }).from(products).where(lte(products.stock, products.min_stock)),
			db.select({ value: count() }).from(orders).where(eq(orders.status, "Pendiente")),
			db.select({ value: count() }).from(picking).where(eq(picking.status, "En Proceso")),
		]);

	return {
		totalProducts: productRows[0]?.value ?? 0,
		totalOrders: orderRows[0]?.value ?? 0,
		totalCustomers: customerRows[0]?.value ?? 0,
		totalStaff: staffRows[0]?.value ?? 0,
		criticalStock: criticalRows[0]?.value ?? 0,
		pendingOrders: pendingRows[0]?.value ?? 0,
		activePicking: pickingRows[0]?.value ?? 0,
	};
}

/** Explicit column projection: never `SELECT *` over accounts. */
export async function listUserProfiles(options: { limit?: number; role?: string } = {}) {
	const limit = clampLimit(options.limit);
	let request = db
		.select({
			id: userProfiles.id,
			email: userProfiles.email,
			name: userProfiles.name,
			role: userProfiles.role,
			zone: userProfiles.zone,
			phone: userProfiles.phone,
			is_active: userProfiles.is_active,
			last_login: userProfiles.last_login,
		})
		.from(userProfiles)
		.$dynamic();

	if (options.role) request = request.where(eq(userProfiles.role, options.role));
	request = request.orderBy(asc(userProfiles.created_at));
	if (limit) request = request.limit(limit);

	return request;
}
