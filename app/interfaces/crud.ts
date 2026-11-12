// ==================== CRUD Service ====================
export interface CrudResult<T> {
	data: T | null;
	error: string | null;
}

export interface ListResult<T> {
	data: T[];
	error: string | null;
}
