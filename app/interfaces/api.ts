// ==================== API Manager ====================
export interface ApiEndpoint {
	path: string;
	defaultParams?: Record<string, string | number>;
}

export interface ApiConfig {
	baseUrl: string;
	endpoints: Record<string, ApiEndpoint>;
	headers?: Record<string, string>;
}

export type ApisRegistry = Record<string, ApiConfig>;

export interface RequestOptions {
	params?: Record<string, string | number>;
	query?: Record<string, string | number | null | undefined>;
	body?: unknown;
	headers?: Record<string, string>;
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	ok: boolean;
	url: string;
}

// ==================== API Response Wrappers ====================
export interface ListResponse<T> {
	success: boolean;
	data: { items: T[] };
}

export interface ItemResponse<T> {
	success: boolean;
	data: T;
}

// ==================== GraphQL ====================
export interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }> }>;
}
