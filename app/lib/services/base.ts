import type { CrudResult, ListResult } from "../../interfaces";
import {
	deleteRowById,
	deleteRowsByIds,
	getById,
	insertRow,
	listRows,
	updateRowById,
} from "../repositories/crud";
import { assertTable } from "../tables";

export type { CrudResult, ListResult } from "../../interfaces";

/**
 * Base CRUD service backed by Drizzle.
 * Server-only: never import this from a client component.
 */
export function createCrudService<T extends Record<string, any>>(table: string) {
	const safeTable = assertTable(table);

	return {
		async list(orderBy?: string): Promise<ListResult<T>> {
			try {
				const data = await listRows(safeTable, { orderBy });
				return { data: data as T[], error: null };
			} catch (e: any) {
				return { data: [], error: e.message || "Error fetching records" };
			}
		},

		async getById(id: number): Promise<CrudResult<T>> {
			try {
				const data = await getById(safeTable, id);
				return { data: (data as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error fetching record" };
			}
		},

		async create(record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const data = await insertRow(safeTable, record as Record<string, unknown>);
				return { data: (data as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error creating record" };
			}
		},

		async update(id: number, record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const data = await updateRowById(safeTable, id, record as Record<string, unknown>);
				return { data: (data as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error updating record" };
			}
		},

		async remove(id: number): Promise<CrudResult<null>> {
			try {
				await deleteRowById(safeTable, id);
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting record" };
			}
		},

		async removeBatch(ids: number[]): Promise<CrudResult<null>> {
			try {
				await deleteRowsByIds(safeTable, ids);
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting records" };
			}
		},
	};
}
