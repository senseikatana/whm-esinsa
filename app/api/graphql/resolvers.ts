import insforge from "../../lib/insforge";
import { uniqueSlug } from "../../lib/services/slugify.service";

async function query(
	table: string,
	options?: { limit?: number; offset?: number; filters?: Record<string, any> },
) {
	let q = insforge.database.from(table).select();

	if (options?.filters) {
		for (const [key, value] of Object.entries(options.filters)) {
			if (value !== undefined && value !== null && value !== "") {
				if (key === "search") continue;
				q = q.eq(key, value);
			}
		}
	}

	q = q.order("id", { ascending: true });

	if (options?.limit) q = q.limit(options.limit);
	if (options?.offset) q = q.range(options.offset, options.offset + (options.limit || 10) - 1);

	const { data, error } = await q;
	if (error) throw new Error(error.message);
	return data ?? [];
}

async function getBySlug(table: string, slug: string) {
	const { data, error } = await insforge.database.from(table).select().eq("slug", slug).single();
	if (error) throw new Error(error.message);
	return data;
}

async function insert(table: string, input: Record<string, any>, slugPrefix?: string) {
	const slug = input.slug || uniqueSlug(slugPrefix || input.name || input.order_number || "item");
	const { data, error } = await insforge.database.from(table).insert([{ ...input, slug }]);
	if (error) throw new Error(error.message);
	return data?.[0];
}

async function update(table: string, slug: string, input: Record<string, any>) {
	const { data, error } = await insforge.database.from(table).update(input).eq("slug", slug);
	if (error) throw new Error(error.message);
	return data?.[0];
}

async function remove(table: string, slug: string) {
	const { error } = await insforge.database.from(table).delete().eq("slug", slug);
	if (error) throw new Error(error.message);
	return true;
}

async function removeBatch(table: string, slugs: string[]) {
	const { error } = await insforge.database.from(table).delete().in("slug", slugs);
	if (error) throw new Error(error.message);
	return true;
}

export const resolvers = {
	Query: {
		products: (_: any, args: any) =>
			query("products", {
				limit: args.limit,
				offset: args.offset,
				filters: { category: args.category },
			}),
		product: (_: any, { slug }: { slug: string }) => getBySlug("products", slug),

		customers: (_: any, args: any) =>
			query("customers", {
				limit: args.limit,
				offset: args.offset,
				filters: { type: args.type },
			}),
		customer: (_: any, { slug }: { slug: string }) => getBySlug("customers", slug),

		orders: (_: any, args: any) =>
			query("orders", {
				limit: args.limit,
				offset: args.offset,
				filters: { status: args.status, priority: args.priority },
			}),
		order: (_: any, { slug }: { slug: string }) => getBySlug("orders", slug),
		inboundOrders: (_: any, { limit }: { limit?: number }) =>
			query("orders", { limit }).then((orders) =>
				orders.filter((o: any) => o.order_number?.startsWith("REC")),
			),
		outboundOrders: (_: any, { limit }: { limit?: number }) =>
			query("orders", { limit }).then((orders) =>
				orders.filter((o: any) => !o.order_number?.startsWith("REC")),
			),

		pickingTasks: (_: any, args: any) =>
			query("picking", {
				limit: args.limit,
				offset: args.offset,
				filters: { status: args.status },
			}),
		pickingTask: (_: any, { slug }: { slug: string }) => getBySlug("picking", slug),

		staff: (_: any, args: any) =>
			query("staff", {
				limit: args.limit,
				offset: args.offset,
				filters: { role: args.role, status: args.status },
			}),
		staffMember: (_: any, { slug }: { slug: string }) => getBySlug("staff", slug),

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
				criticalStock: products.filter((p: any) => p.stock <= p.min_stock).length,
				pendingOrders: orders.filter((o: any) => o.status === "Pendiente").length,
				activePicking: picking.filter((p: any) => p.status === "En Proceso").length,
			};
		},

		userProfiles: (_: any, args: any) =>
			query("user_profiles", {
				limit: args.limit,
				filters: { role: args.role },
			}),
	},

	Mutation: {
		createProduct: (_: any, { input }: { input: any }) =>
			insert("products", { ...input, slug: uniqueSlug(input.sku || input.name) }),
		updateProduct: (_: any, { slug, input }: { slug: string; input: any }) =>
			update("products", slug, input),
		deleteProduct: (_: any, { slug }: { slug: string }) => remove("products", slug),
		deleteProducts: (_: any, { slugs }: { slugs: string[] }) => removeBatch("products", slugs),

		createCustomer: (_: any, { input }: { input: any }) =>
			insert("customers", { ...input, slug: uniqueSlug(input.code || input.name) }),
		updateCustomer: (_: any, { slug, input }: { slug: string; input: any }) =>
			update("customers", slug, input),
		deleteCustomer: (_: any, { slug }: { slug: string }) => remove("customers", slug),

		createOrder: (_: any, { input }: { input: any }) =>
			insert("orders", { ...input, slug: uniqueSlug(input.order_number || input.customer_name) }),
		updateOrder: (_: any, { slug, input }: { slug: string; input: any }) =>
			update("orders", slug, input),
		deleteOrder: (_: any, { slug }: { slug: string }) => remove("orders", slug),
		deleteOrders: (_: any, { slugs }: { slugs: string[] }) => removeBatch("orders", slugs),

		createPickingTask: (_: any, { input }: { input: any }) =>
			insert("picking", { ...input, slug: uniqueSlug(input.task_number || input.order_number) }),
		updatePickingTask: (_: any, { slug, input }: { slug: string; input: any }) =>
			update("picking", slug, input),
		deletePickingTask: (_: any, { slug }: { slug: string }) => remove("picking", slug),

		createStaff: (_: any, { input }: { input: any }) =>
			insert("staff", { ...input, slug: uniqueSlug(input.name) }),
		updateStaff: (_: any, { slug, input }: { slug: string; input: any }) =>
			update("staff", slug, input),
		deleteStaff: (_: any, { slug }: { slug: string }) => remove("staff", slug),
		deleteStaffMembers: (_: any, { slugs }: { slugs: string[] }) => removeBatch("staff", slugs),
	},
};
