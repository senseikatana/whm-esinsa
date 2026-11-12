import { GraphQLError } from "graphql";
import type { SessionUser } from "../../lib/api-auth";
import {
	dashboardStats,
	deleteRowBySlug,
	deleteRowsBySlugs,
	getBySlug,
	insertRow,
	listRows,
	listUserProfiles,
	updateRowBySlug,
} from "../../lib/repositories/crud";
import type { TableName } from "../../lib/tables";

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

const SEARCH_COLUMNS: Record<string, string[]> = {
	products: ["sku", "name", "category", "location"],
	customers: ["code", "name", "email", "phone"],
	orders: ["order_number", "customer_name"],
};

function query(
	table: TableName,
	options: {
		limit?: number;
		offset?: number;
		filters?: Record<string, unknown>;
		search?: string | null;
	} = {},
) {
	return listRows(table, {
		limit: options.limit,
		offset: options.offset,
		filters: options.filters,
		search: { term: options.search, columns: SEARCH_COLUMNS[table] ?? [] },
	});
}

const Query = {
	products: (
		_: unknown,
		args: { limit?: number; offset?: number; category?: string; search?: string },
	) =>
		query("products", {
			limit: args.limit,
			offset: args.offset,
			filters: { category: args.category },
			search: args.search,
		}),
	product: (_: unknown, { slug }: { slug: string }) => getBySlug("products", slug),

	customers: (
		_: unknown,
		args: { limit?: number; offset?: number; type?: string; search?: string },
	) =>
		query("customers", {
			limit: args.limit,
			offset: args.offset,
			filters: { type: args.type },
			search: args.search,
		}),
	customer: (_: unknown, { slug }: { slug: string }) => getBySlug("customers", slug),

	orders: (
		_: unknown,
		args: {
			limit?: number;
			offset?: number;
			status?: string;
			priority?: string;
			search?: string;
		},
	) =>
		query("orders", {
			limit: args.limit,
			offset: args.offset,
			filters: { status: args.status, priority: args.priority },
			search: args.search,
		}),
	order: (_: unknown, { slug }: { slug: string }) => getBySlug("orders", slug),
	inboundOrders: async (_: unknown, { limit }: { limit?: number }) => {
		const rows = await query("orders", { limit });
		return rows.filter((order: any) => order.order_number?.startsWith("REC"));
	},
	outboundOrders: async (_: unknown, { limit }: { limit?: number }) => {
		const rows = await query("orders", { limit });
		return rows.filter((order: any) => !order.order_number?.startsWith("REC"));
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

	dashboardStats: () => dashboardStats(),

	userProfiles: (_: unknown, args: { limit?: number; role?: string }, ctx: Ctx) => {
		requireRole(ctx, ["admin", "manager"]);
		return listUserProfiles({ limit: args.limit, role: args.role });
	},
};

const Mutation = {
	createProduct: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insertRow("products", input),
	updateProduct: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		updateRowBySlug("products", slug, input),
	deleteProduct: (_: unknown, { slug }: { slug: string }) => deleteRowBySlug("products", slug),
	deleteProducts: (_: unknown, { slugs }: { slugs: string[] }) =>
		deleteRowsBySlugs("products", slugs),

	createCustomer: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insertRow("customers", input),
	updateCustomer: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		updateRowBySlug("customers", slug, input),
	deleteCustomer: (_: unknown, { slug }: { slug: string }) => deleteRowBySlug("customers", slug),

	createOrder: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insertRow("orders", input),
	updateOrder: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		updateRowBySlug("orders", slug, input),
	deleteOrder: (_: unknown, { slug }: { slug: string }) => deleteRowBySlug("orders", slug),
	deleteOrders: (_: unknown, { slugs }: { slugs: string[] }) => deleteRowsBySlugs("orders", slugs),

	createPickingTask: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insertRow("picking", input),
	updatePickingTask: (
		_: unknown,
		{ slug, input }: { slug: string; input: Record<string, unknown> },
	) => updateRowBySlug("picking", slug, input),
	deletePickingTask: (_: unknown, { slug }: { slug: string }) => deleteRowBySlug("picking", slug),

	createStaff: (_: unknown, { input }: { input: Record<string, unknown> }) =>
		insertRow("staff", input),
	updateStaff: (_: unknown, { slug, input }: { slug: string; input: Record<string, unknown> }) =>
		updateRowBySlug("staff", slug, input),
	deleteStaff: (_: unknown, { slug }: { slug: string }) => deleteRowBySlug("staff", slug),
	deleteStaffMembers: (_: unknown, { slugs }: { slugs: string[] }) =>
		deleteRowsBySlugs("staff", slugs),
};

export const resolvers = { Query, Mutation: withWriteGuard(Mutation) };
