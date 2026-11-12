import type { GraphQLResponse } from "../../interfaces";
import { api } from "../services/api-manager";

/**
 * Cliente GraphQL que usa el API Manager.
 * Para queries complejas que necesitan múltiples recursos en una sola llamada.
 */
export async function graphqlQuery<T = unknown>(
	query: string,
	variables?: Record<string, unknown>,
): Promise<T> {
	const response = await api.post<GraphQLResponse<T>>("warehouse", "graphql", {
		query,
		variables,
	});

	if (response.data.errors?.length) {
		const messages = response.data.errors.map((e) => e.message).join(", ");
		throw new Error(`GraphQL Error: ${messages}`);
	}

	if (!response.data.data) {
		throw new Error("GraphQL: respuesta sin datos");
	}

	return response.data.data;
}

// ==================== Multi-resource queries ====================

/**
 * Carga el dashboard completo en una sola llamada GraphQL.
 */
export async function loadDashboard() {
	return graphqlQuery<{
		dashboardStats: {
			totalProducts: number;
			totalOrders: number;
			totalCustomers: number;
			totalStaff: number;
			criticalStock: number;
			pendingOrders: number;
			activePicking: number;
		};
		products: Array<{ id: number; slug: string; name: string; stock: number; min_stock: number }>;
		inboundOrders: Array<{ id: number; slug: string; order_number: string; status: string }>;
		outboundOrders: Array<{ id: number; slug: string; order_number: string; status: string }>;
	}>(`query Dashboard {
		dashboardStats {
			totalProducts
			totalOrders
			totalCustomers
			totalStaff
			criticalStock
			pendingOrders
			activePicking
		}
		products(limit: 5) {
			id slug name stock min_stock
		}
		inboundOrders(limit: 3) {
			id slug order_number status
		}
		outboundOrders(limit: 3) {
			id slug order_number status
		}
	}`);
}

/**
 * Carga inventario con productos críticos en una sola llamada.
 */
export async function loadInventoryWithAlerts() {
	return graphqlQuery<{
		products: Array<{
			id: number;
			slug: string;
			sku: string;
			name: string;
			category: string;
			stock: number;
			min_stock: number;
			location: string;
			price: number;
		}>;
	}>(`query Inventory {
		products(limit: 100) {
			id slug sku name category stock min_stock location price
		}
	}`);
}

/**
 * Carga una orden completa con datos del cliente en una sola llamada.
 */
export async function loadOrderDetail(slug: string) {
	return graphqlQuery<{
		order: {
			id: number;
			slug: string;
			order_number: string;
			customer_name: string;
			status: string;
			priority: string;
			total_items: number;
			total_value: number;
		};
	}>(
		`query OrderDetail($slug: String!) {
		order(slug: $slug) {
			id slug order_number customer_name status priority total_items total_value
		}
	}`,
		{ slug },
	);
}
