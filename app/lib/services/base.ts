import type { CrudResult, ListResult } from "../../interfaces";
import { pool } from "../db";
import { assertTable, pickColumns } from "../table-columns";

export type { CrudResult, ListResult } from "../../interfaces";

/**
 * Base CRUD service backed by Postgres.
 * Server-only: never import this from a client component.
 */
export function createCrudService<T extends Record<string, any>>(table: string) {
	const safeTable = assertTable(table);

	return {
		async list(orderBy?: string): Promise<ListResult<T>> {
			try {
				const allowedOrder = orderBy && /^[a-z_]+$/.test(orderBy) ? orderBy : "id";
				const { rows } = await pool.query(`SELECT * FROM ${safeTable} ORDER BY ${allowedOrder} ASC`);
				return { data: rows as T[], error: null };
			} catch (e: any) {
				return { data: [], error: e.message || "Error fetching records" };
			}
		},

		async getById(id: number): Promise<CrudResult<T>> {
			try {
				const { rows } = await pool.query(`SELECT * FROM ${safeTable} WHERE id = $1 LIMIT 1`, [id]);
				return { data: (rows[0] as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error fetching record" };
			}
		},

		async create(record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const values = pickColumns(safeTable, record as Record<string, unknown>);
				const columns = Object.keys(values);
				if (columns.length === 0) return { data: null, error: "Sin datos para insertar" };

				const placeholders = columns.map((_, index) => `$${index + 1}`);
				const { rows } = await pool.query(
					`INSERT INTO ${safeTable} (${columns.join(", ")})
					 VALUES (${placeholders.join(", ")})
					 RETURNING *`,
					Object.values(values),
				);
				return { data: (rows[0] as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error creating record" };
			}
		},

		async update(id: number, record: Partial<T>): Promise<CrudResult<T>> {
			try {
				const values = pickColumns(safeTable, record as Record<string, unknown>);
				const columns = Object.keys(values);
				if (columns.length === 0) return { data: null, error: "Sin datos para actualizar" };

				const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
				const { rows } = await pool.query(
					`UPDATE ${safeTable}
					 SET ${assignments.join(", ")}
					 WHERE id = $${columns.length + 1}
					 RETURNING *`,
					[...Object.values(values), id],
				);
				return { data: (rows[0] as T) ?? null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error updating record" };
			}
		},

		async remove(id: number): Promise<CrudResult<null>> {
			try {
				await pool.query(`DELETE FROM ${safeTable} WHERE id = $1`, [id]);
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting record" };
			}
		},

		async removeBatch(ids: number[]): Promise<CrudResult<null>> {
			try {
				if (ids.length === 0) return { data: null, error: null };
				await pool.query(`DELETE FROM ${safeTable} WHERE id = ANY($1::bigint[])`, [ids]);
				return { data: null, error: null };
			} catch (e: any) {
				return { data: null, error: e.message || "Error deleting records" };
			}
		},
	};
}
