import { getTableColumns } from "drizzle-orm";
import { customers, orders, picking, products, staff } from "./schema";

export const TABLE_MAP = {
	products,
	customers,
	orders,
	picking,
	staff,
} as const;

export type TableName = keyof typeof TABLE_MAP;

const READ_ONLY_COLUMNS = new Set(["id", "slug", "created_at", "updated_at"]);

/** Writable columns per table, derived from the Drizzle schema. */
export const TABLE_COLUMNS = Object.fromEntries(
	Object.entries(TABLE_MAP).map(([name, table]) => [
		name,
		Object.keys(getTableColumns(table)).filter((column) => !READ_ONLY_COLUMNS.has(column)),
	]),
) as Record<TableName, string[]>;

export function assertTable(table: string): TableName {
	if (!Object.hasOwn(TABLE_MAP, table)) {
		throw new Error(`Tabla no permitida: ${table}`);
	}
	return table as TableName;
}

export function getTable(table: TableName) {
	return TABLE_MAP[table];
}

/** UI/API bodies are camelCase; the database is snake_case. */
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
	const safeTable = assertTable(table);
	const allowed = TABLE_COLUMNS[safeTable];
	const mapped = mapToSnakeCase(body);

	return Object.fromEntries(
		Object.entries(mapped).filter(([key, value]) => allowed.includes(key) && value !== undefined),
	);
}
