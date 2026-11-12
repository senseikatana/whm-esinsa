import type { CrudResult, ListResult } from "../../interfaces";
import insforge from "../insforge";

export type { CrudResult, ListResult } from "../../interfaces";

/**
 * Base CRUD service for InsForge tables.
 * All entity services extend this.
 */
export function createCrudService<T extends Record<string, any>>(table: string) {
	return {
		async list(orderBy?: string): Promise<ListResult<T>> {
			try {
				let query = insforge.database.from(table).select();
				if (orderBy) {
					query = query.order(orderBy, { ascending: true });
				}
				const { data, error } = await query;
				if (error) return { data: [], error: error.message };
				return { data: (data as T[]) || [], error: null };
			} catch (e: any) {
				return { data: [], error: e.message || "Error fetching records" };
			}
		},

		async getById(id: number): Promise<CrudResult<T>> {
			try {
				const { data, error } = await insforge.database.from(table).select().eq("id", id).single();
				if (error) return { data: null, error: error.message };
				return { data: data as T, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error fetching record" };
			}
		},

		async create(record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const { data, error } = await insforge.database.from(table).insert([record]);
				if (error) return { data: null, error: error.message };
				return { data: (data as unknown as T[])?.[0] ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error creating record" };
			}
		},

		async update(id: number, record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const { data, error } = await insforge.database.from(table).update(record).eq("id", id);
				if (error) return { data: null, error: error.message };
				return { data: (data as unknown as T[])?.[0] ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error updating record" };
			}
		},

		async remove(id: number): Promise<CrudResult<null>> {
			try {
				const { error } = await insforge.database.from(table).delete().eq("id", id);
				if (error) return { data: null, error: error.message };
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting record" };
			}
		},

		async removeBatch(ids: number[]): Promise<CrudResult<null>> {
			try {
				const { error } = await insforge.database.from(table).delete().in("id", ids);
				if (error) return { data: null, error: error.message };
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting records" };
			}
		},
	};
}
