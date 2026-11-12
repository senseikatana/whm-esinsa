import type {
	Customer,
	ItemResponse,
	ListResponse,
	Order,
	PickingTask,
	Product,
	Staff,
} from "../../interfaces";
import { withBasePath } from "../base-path";
import { api } from "../services/api-manager";

export type { Customer, Order, PickingTask, Product, Staff } from "../../interfaces";

/**
 * Configuración de la API del Warehouse.
 * Se inicializa una vez al arrancar la app.
 */
export function initWarehouseApi(baseUrl: string) {
	api.init({
		warehouse: {
			baseUrl,
			endpoints: {
				// Products
				products: { path: withBasePath("/api/products"), defaultParams: { limit: 50 } },
				product: { path: withBasePath("/api/products/:slug") },

				// Customers
				customers: { path: withBasePath("/api/customers"), defaultParams: { limit: 50 } },
				customer: { path: withBasePath("/api/customers/:slug") },

				// Orders
				orders: { path: withBasePath("/api/orders"), defaultParams: { limit: 50 } },
				order: { path: withBasePath("/api/orders/:slug") },
				inboundOrders: { path: withBasePath("/api/orders"), defaultParams: { type: "inbound" } },
				outboundOrders: { path: withBasePath("/api/orders"), defaultParams: { type: "outbound" } },

				// Picking
				pickingTasks: { path: withBasePath("/api/picking-tasks"), defaultParams: { limit: 50 } },
				pickingTask: { path: withBasePath("/api/picking-tasks/:slug") },

				// Staff
				staff: { path: withBasePath("/api/staff"), defaultParams: { limit: 50 } },
				staffMember: { path: withBasePath("/api/staff/:slug") },

				// GraphQL
				graphql: { path: withBasePath("/api/graphql") },
			},
		},
	});
}

// ==================== Typed helpers ====================

// ==================== Products ====================

export const productsApi = {
	list: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Product>>("warehouse", "products", { query }),

	get: (slug: string) =>
		api.get<ItemResponse<Product>>("warehouse", "product", { params: { slug } }),

	create: (input: Partial<Product>) =>
		api.post<ItemResponse<Product>>("warehouse", "products", input),

	update: (slug: string, input: Partial<Product>) =>
		api.put<ItemResponse<Product>>("warehouse", "product", input, { params: { slug } }),

	delete: (slug: string) => api.delete("warehouse", "product", { params: { slug } }),
};

// ==================== Customers ====================

export const customersApi = {
	list: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Customer>>("warehouse", "customers", { query }),

	get: (slug: string) =>
		api.get<ItemResponse<Customer>>("warehouse", "customer", { params: { slug } }),

	create: (input: Partial<Customer>) =>
		api.post<ItemResponse<Customer>>("warehouse", "customers", input),

	update: (slug: string, input: Partial<Customer>) =>
		api.put<ItemResponse<Customer>>("warehouse", "customer", input, { params: { slug } }),

	delete: (slug: string) => api.delete("warehouse", "customer", { params: { slug } }),
};

// ==================== Orders ====================

export const ordersApi = {
	list: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Order>>("warehouse", "orders", { query }),

	get: (slug: string) => api.get<ItemResponse<Order>>("warehouse", "order", { params: { slug } }),

	inbound: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Order>>("warehouse", "inboundOrders", { query }),

	outbound: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Order>>("warehouse", "outboundOrders", { query }),

	create: (input: Partial<Order>) => api.post<ItemResponse<Order>>("warehouse", "orders", input),

	update: (slug: string, input: Partial<Order>) =>
		api.put<ItemResponse<Order>>("warehouse", "order", input, { params: { slug } }),

	delete: (slug: string) => api.delete("warehouse", "order", { params: { slug } }),
};

// ==================== Picking ====================

export const pickingApi = {
	list: (query?: Record<string, string | number>) =>
		api.get<ListResponse<PickingTask>>("warehouse", "pickingTasks", { query }),

	get: (slug: string) =>
		api.get<ItemResponse<PickingTask>>("warehouse", "pickingTask", { params: { slug } }),

	create: (input: Partial<PickingTask>) =>
		api.post<ItemResponse<PickingTask>>("warehouse", "pickingTasks", input),

	update: (slug: string, input: Partial<PickingTask>) =>
		api.put<ItemResponse<PickingTask>>("warehouse", "pickingTask", input, { params: { slug } }),

	delete: (slug: string) => api.delete("warehouse", "pickingTask", { params: { slug } }),
};

// ==================== Staff ====================

export const staffApi = {
	list: (query?: Record<string, string | number>) =>
		api.get<ListResponse<Staff>>("warehouse", "staff", { query }),

	get: (slug: string) =>
		api.get<ItemResponse<Staff>>("warehouse", "staffMember", { params: { slug } }),

	create: (input: Partial<Staff>) => api.post<ItemResponse<Staff>>("warehouse", "staff", input),

	update: (slug: string, input: Partial<Staff>) =>
		api.put<ItemResponse<Staff>>("warehouse", "staffMember", input, { params: { slug } }),

	delete: (slug: string) => api.delete("warehouse", "staffMember", { params: { slug } }),
};
