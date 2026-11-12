import { GraphQLError } from "graphql";
import type { SessionUser } from "../../lib/api-auth";
import { pool } from "../../lib/db";
import { assertTable, pickColumns, TABLE_COLUMNS } from "../../lib/table-columns";

interface Ctx {
	user: SessionUser | null;
}

function requireWrite(ctx: Ctx) {
	if (!ctx.user || ctx.user.role === "viewer") {
		throw new GraphQLError("No tenés permisos para esta acción", {
			extensions: { code: "FORBIDDEN" },
		});
	}
}

function requireRole(ctx: Ctx, roles: SessionUser["role"][]) {
	if (!ctx.user || !roles.includes(ctx.user.role)) {
		throw new GraphQLError("No tenés permisos para esta acción", {
			extensions: { code: "FORBIDDEN" },
		});
	}
}

function withWriteGuard<T extends Record<string, (...args: any[]) => any>>(mutation: T): T {
	return Object.fromEntries(
		Object.entries(mutation).map(([name, resolver]) => [
			name,
			(parent: unknown, args: unknown, ctx: Ctx, info: unknown) => {
				requireWrite(ctx);
				return resolver(parent, args, ctx, info);
			},
		]),
	) as T;
}

interface QueryOptions {
	limit?: number;
	offset?: number;
	filters?: Record<string, unknown>;
}

function clampLimit(limit?: number): number | null {
	if (!limit || !Number.isFinite(limit)) return null;
	return Math.min(Math.max(Math.trunc(limit), 1), 500);
}

async function query(table: string, options?: QueryOptions) {
	const safeTable = assertTable(table);
	const values: unknown[] = [];
	const where: string[] = [];

	if (options?.filters) {
		const allowed: readonly string[] = TABLE_COLUMNS[safeTable];
		for (const [column, value] of Object.entries(options.filters)) {
			if (value === undefined || value === null || value === "") continue;
			if (!allowed.includes(column)) continue;
			values.push(value);
			where.push(`${column} = $${values.length}`);
		}
	}

	let sql = `SELECT * FROM ${safeTable}`;
	if (where.length > 0) sql += ` WHERE ${where.join(" AND ")}`;
	sql += " ORDER BY id ASC";

	const limit = clampLimit(options?.limit);
	if (limit) {
		values.push(limit);
		sql += ` LIMIT $${values.length}`;
	}
	if (options?.offset && options.offset > 0) {
		values.push(Math.trunc(options.offset));
		sql += ` OFFSET $${values.length}`;
	}

	const { rows } = await pool.query(sql, values);
	return rows;
}

async function getBySlug(table: string, slug: string) {
	const safeTable = assertTable(table);
	const { rows } = await pool.query(`SELECT * FROM ${safeTable} WHERE slug = $1 LIMIT 1`, [slug]);
	return rows[0] ?? null;
}

async function insert(table: string, input: Record<string, unknown>) {
	const safeTable = assertTable(table);
	const values = pickColumns(safeTable, input);
	const columns = Object.keys(values);

	if (columns.length === 0) throw new Error("Sin datos para insertar");

	const placeholders = columns.map((_, index) => `$${index + 1}`);
	const { rows } = await pool.query(
		`INSERT INTO ${safeTable} (${columns.join(", ")})
		 VALUES (${placeholders.join(", ")})
		 RETURNING *`,
		Object.values(values),
	);
	return rows[0] ?? null;
}

async function update(table: string, slug: string, input: Record<string, unknown>) {
	const safeTable = assertTable(table);
	const values = pickColumns(safeTable, input);
	const columns = Object.keys(values);

	if (columns.length === 0) throw new Error("Sin datos para actualizar");

	const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
	const { rows } = await pool.query(
		`UPDATE ${safeTable}
		 SET ${assignments.join(", ")}
		 WHERE slug = $${columns.length + 1}
		 RETURNING *`,
		[...Object.values(values), slug],
	);
	return rows[0] ?? null;
}

async function remove(table: string, slug: string) {
	const safeTable = assertTable(table);
	await pool.query(`DELETE FROM ${safeTable} WHERE slug = $1`, [slug]);
	return true;
}

async function removeBatch(table: string, slugs: string[]) {
	const safeTable = assertTable(table);
	if (slugs.length === 0) return true;
	await pool.query(`DELETE FROM ${safeTable} WHERE slug = ANY($1::text[])`, [slugs]);
	return true;
}

const Query = {
	products: (_: unknown, args: { limit?: number; offset?: number; category?: string }) =>
		query("products", {
			limit: args.limit,
			offset: args.offset,
			filters: { category: args.category },
		}),
	product: (_: unknown, { slug }: { slug: string }) => getBySlug("products", slug),

	customers: (_: unknown, args: { limit?: number; offset?: number; type?: string }) =>
		query("customers", {
			limit: args.limit,
			offset: args.offset,
			filters: { type: args.type },
		}),
	customer: (_: unknown, { slug }: { slug: string }) => getBySlug("customers", slug),

	orders: (
		_: unknown,
		args: { limit?: number; offset?: number; status?: string; priority?: string },
	) =>
		query("orders", {
			limit: args.limit,
			offset: args.offset,
			filters: { status: args.status, priority: args.priority },
		}),
	order: (_: unknown, { slug }: { slug: string }) => getBySlug("orders", slug),
	inboundOrders: async (_: unknown, { limit }: { limit?: number }) => {
		const orders = await query("orders", { limit });
		return orders.filter((order: { order_number?: string }) => order.order_number?.startsWith("REC"));
	},
	outboundOrders: async (_: unknown, { limit }: { limit?: number }) => {
		const orders = await query("orders", { limit });
		return orders.filter(
			(order: { order_number?: string }) => !order.order_number?.startsWith("REC"),
		);
	},

	pickingTasks: (_: unknown, args: { limit?: number; offset?: number; status?: string }) =>
		query("picking", {
			limit: args.limit,
			offset: args.offset,
			filters: { status: args.status },
		}),
	pickingTask: (_: unknown, { slug }: { slug: string }) => getBySlug("picking", slug),

	staff: (_: unknown, args: { limit?: number; offset?: number; role?: string; status?: string }) =>
		query("staff", {
			limit: args.limit,
			offset: args.offset,
			filters: { role: args.role, status: args.status },
		}),
	staffMember: (_: unknown, { slug }: { slug: string }) => getBySlug("staff", slug),

	dashboardStats: async () => {
		const [products, orders, customers, staff, picking] = await Promise.all([
			query("products"),
			query("orders"),
			query("customers"),
			query("staff"),
			query("picking"),
		]);

		return {
			totalProducts: products.length,
			totalOrders: orders.length,
			totalCustomers: customers.length,
			totalStaff: staff.length,
			criticalStock: products.filter(
				(product: { stock: number; min_stock: number }) => product.stock <= product.min_stock,
			).length,
			pendingOrders: orders.filter((order: { status: string }) => order.status === "Pendiente").length,
			activePicking: picking.filter((task: { status: string }) => task.status === "En Proceso").length,
		};
	},

	userProfiles: (_: unknown, args: { limit?: number; role?: string }, ctx: Ctx) => {
		requireRole(ctx, ["admin", "manager"]);
		const limit = clampLimit(args.limit);
		const values: unknown[] = [];
		let sql = "SELECT * FROM user_profiles";

		if (args.role) {
			values.push(args.role);
			sql += ` WHERE role = $${values.length}`;
		}
		sql += " ORDER BY created_at ASC";
		if (limit) {
			values.push(limit);
			sql += ` LIMIT $${values.length}`;
		}

		return pool.query(sql, values).then((result) => result.rows);
	},
};

const Mutation = {
	createProduct: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insert("products", input),
	updateProduct: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		update("products", slug, input),
	deleteProduct: (_: unknown, { slug }: { slug: string }) => remove("products", slug),
	deleteProducts: (_: unknown, { slugs }: { slugs: string[] }) => removeBatch("products", slugs),

	createCustomer: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insert("customers", input),
	updateCustomer: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		update("customers", slug, input),
	deleteCustomer: (_: unknown, { slug }: { slug: string }) => remove("customers", slug),

	createOrder: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insert("orders", input),
	updateOrder: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		update("orders", slug, input),
	deleteOrder: (_: unknown, { slug }: { slug: string }) => remove("orders", slug),
	deleteOrders: (_: unknown, { slugs }: { slugs: string[] }) => removeBatch("orders", slugs),

	createPickingTask: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insert("picking", input),
	updatePickingTask: (
		_: unknown,
		{ slug, input }: { slug: string; input: Record<string, unknown> },
	) => update("picking", slug, input),
	deletePickingTask: (_: unknown, { slug }: { slug: string }) => remove("picking", slug),

	createStaff: (_: unknown, { input }: { input: Record<string, unknown> }) => insert("staff", input),
	updateStaff: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		update("staff", slug, input),
	deleteStaff: (_: unknown, { slug }: { slug: string }) => remove("staff", slug),
	deleteStaffMembers: (_: unknown, { slugs }: { slugs: string[] }) => removeBatch("staff", slugs),
};

export const resolvers = { Query, Mutation: withWriteGuard(Mutation) };
