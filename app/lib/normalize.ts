/**
 * Normalizers: snake_case (backend/DB) → camelCase (frontend).
 * Ensures consistent field names regardless of data source.
 */

export function normalizeProduct(row: Record<string, any>) {
	return {
		id: row.id,
		slug: row.slug ?? "",
		sku: row.sku ?? "",
		name: row.name ?? "",
		category: row.category ?? "",
		stock: row.stock ?? 0,
		minStock: row.min_stock ?? row.minStock ?? 0,
		location: row.location ?? "",
		price: Number(row.price ?? 0),
	};
}

export function normalizeCustomer(row: Record<string, any>) {
	return {
		id: row.id,
		slug: row.slug ?? "",
		code: row.code ?? "",
		name: row.name ?? "",
		type: row.type ?? "",
		email: row.email ?? "",
		phone: row.phone ?? "",
		status: row.status ?? "",
	};
}

export function normalizeOrder(row: Record<string, any>) {
	return {
		id: row.id,
		slug: row.slug ?? "",
		orderNumber: row.order_number ?? row.orderNumber ?? "",
		customerName: row.customer_name ?? row.customerName ?? "",
		status: row.status ?? "",
		priority: row.priority ?? "normal",
		totalItems: row.total_items ?? row.totalItems ?? 0,
		totalValue: Number(row.total_value ?? row.totalValue ?? 0),
	};
}

export function normalizePicking(row: Record<string, any>) {
	return {
		id: row.id,
		slug: row.slug ?? "",
		taskNumber: row.task_number ?? row.taskNumber ?? "",
		orderNumber: row.order_number ?? row.orderNumber ?? "",
		assignedTo: row.assigned_to ?? row.assignedTo ?? "",
		zone: row.zone ?? "",
		status: row.status ?? "",
		totalItems: row.total_items ?? row.totalItems ?? 0,
		pickedItems: row.picked_items ?? row.pickedItems ?? 0,
	};
}

export function normalizeStaff(row: Record<string, any>) {
	return {
		id: row.id,
		slug: row.slug ?? "",
		name: row.name ?? "",
		role: row.role ?? "",
		zone: row.zone ?? "",
		status: row.status ?? "",
	};
}
