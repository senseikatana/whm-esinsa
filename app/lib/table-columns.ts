/** Allowlisted writable columns per table. Anything else in a request body is dropped. */
export const TABLE_COLUMNS = {
	products: ["sku", "name", "category", "stock", "min_stock", "location", "price"],
	customers: ["code", "name", "type", "email", "phone", "status"],
	orders: [
		"order_number",
		"customer_name",
		"customer_id",
		"status",
		"priority",
		"total_items",
		"total_value",
	],
	picking: [
		"task_number",
		"order_number",
		"order_id",
		"assigned_to",
		"staff_id",
		"zone",
		"status",
		"total_items",
		"picked_items",
	],
	staff: ["name", "role", "zone", "status"],
} as const satisfies Record<string, readonly string[]>;

export type TableName = keyof typeof TABLE_COLUMNS;

export function assertTable(table: string): TableName {
	if (!Object.hasOwn(TABLE_COLUMNS, table)) {
		throw new Error(`Tabla no permitida: ${table}`);
	}
	return table as TableName;
}

export function mapToSnakeCase(body: Record<string, unknown>): Record<string, unknown> {
	const {
		minStock,
		orderNumber,
		customerName,
		customerId,
		totalItems,
		totalValue,
		taskNumber,
		assignedTo,
		staffId,
		pickedItems,
		...mapped
	} = body;

	if (minStock !== undefined) mapped.min_stock = minStock;
	if (orderNumber !== undefined) mapped.order_number = orderNumber;
	if (customerName !== undefined) mapped.customer_name = customerName;
	if (customerId !== undefined) mapped.customer_id = customerId;
	if (totalItems !== undefined) mapped.total_items = totalItems;
	if (totalValue !== undefined) mapped.total_value = totalValue;
	if (taskNumber !== undefined) mapped.task_number = taskNumber;
	if (assignedTo !== undefined) mapped.assigned_to = assignedTo;
	if (staffId !== undefined) mapped.staff_id = staffId;
	if (pickedItems !== undefined) mapped.picked_items = pickedItems;

	return mapped;
}

/** Normalizes a body to allowlisted snake_case columns with undefined values removed. */
export function pickColumns(table: string, body: Record<string, unknown>): Record<string, unknown> {
	const allowed: readonly string[] = TABLE_COLUMNS[assertTable(table)];
	const mapped = mapToSnakeCase(body);

	return Object.fromEntries(
		Object.entries(mapped).filter(([key, value]) => allowed.includes(key) && value !== undefined),
	);
}
