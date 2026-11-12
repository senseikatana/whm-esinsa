import type { ApiConfig, ApiResponse, ApisRegistry, RequestOptions } from "../../interfaces";
import ApiError from "./api-error";

export type {
	ApiConfig,
	ApiEndpoint,
	ApiResponse,
	ApisRegistry,
	RequestOptions,
} from "../../interfaces";

// ==================== API Manager ====================

export class ApiManager {
	private static instance: ApiManager;
	private apis: ApisRegistry = {};

	private constructor() {}

	static getInstance(): ApiManager {
		if (!ApiManager.instance) {
			ApiManager.instance = new ApiManager();
		}
		return ApiManager.instance;
	}

	/**
	 * Inicializa el registro de APIs.
	 * Llamar una vez al arrancar la app.
	 */
	init(apis: ApisRegistry): void {
		this.apis = { ...this.apis, ...apis };
	}

	/**
	 * Registra o actualiza una API.
	 */
	register(name: string, config: ApiConfig): void {
		this.apis[name] = config;
	}

	/**
	 * Obtiene la config de una API.
	 */
	getApi(name: string): ApiConfig {
		const api = this.apis[name];
		if (!api) throw ApiError.notFound(`API "${name}" no registrada`);
		return api;
	}

	/**
	 * Construye la URL final con path params y query params.
	 */
	buildUrl(apiName: string, endpointName: string, opts: RequestOptions = {}): string {
		const api = this.getApi(apiName);
		const endpoint = api.endpoints[endpointName];

		if (!endpoint) {
			throw ApiError.notFound(`Endpoint "${endpointName}" no encontrado en "${apiName}"`);
		}

		let path = endpoint.path;

		// Reemplazar path params (:slug, :id, etc.)
		if (opts.params) {
			for (const [key, value] of Object.entries(opts.params)) {
				path = path.replace(`:${key}`, encodeURIComponent(String(value)));
			}
		}

		const url = new URL(path, api.baseUrl);

		// Merge default params + query params
		const mergedQuery = { ...endpoint.defaultParams, ...opts.query };
		for (const [key, value] of Object.entries(mergedQuery)) {
			if (value != null) url.searchParams.set(key, String(value));
		}

		return url.toString();
	}

	/**
	 * Método genérico de fetch.
	 */
	async request<T = unknown>(
		apiName: string,
		endpointName: string,
		method: string,
		opts: RequestOptions = {},
	): Promise<ApiResponse<T>> {
		const url = this.buildUrl(apiName, endpointName, opts);
		const api = this.getApi(apiName);

		const headers: Record<string, string> = {
			...api.headers,
			...opts.headers,
		};

		if (opts.body && !headers["Content-Type"]) {
			headers["Content-Type"] = "application/json";
		}

		try {
			const response = await fetch(url, {
				method,
				headers,
				body: opts.body ? JSON.stringify(opts.body) : undefined,
			});

			if (!response.ok) {
				throw ApiError.custom(
					`${apiName}/${endpointName}: ${response.status} ${response.statusText}`,
					response.status,
				);
			}

			const data = (await response.json()) as T;
			return { data, status: response.status, ok: response.ok, url: response.url };
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw ApiError.internal(
				`Error de red: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	// ==================== HTTP Shortcuts ====================

	async get<T>(
		apiName: string,
		endpointName: string,
		opts?: RequestOptions,
	): Promise<ApiResponse<T>> {
		return this.request<T>(apiName, endpointName, "GET", opts);
	}

	async post<T>(
		apiName: string,
		endpointName: string,
		body: unknown,
		opts?: RequestOptions,
	): Promise<ApiResponse<T>> {
		return this.request<T>(apiName, endpointName, "POST", { ...opts, body });
	}

	async put<T>(
		apiName: string,
		endpointName: string,
		body: unknown,
		opts?: RequestOptions,
	): Promise<ApiResponse<T>> {
		return this.request<T>(apiName, endpointName, "PUT", { ...opts, body });
	}

	async patch<T>(
		apiName: string,
		endpointName: string,
		body: unknown,
		opts?: RequestOptions,
	): Promise<ApiResponse<T>> {
		return this.request<T>(apiName, endpointName, "PATCH", { ...opts, body });
	}

	async delete<T>(
		apiName: string,
		endpointName: string,
		opts?: RequestOptions,
	): Promise<ApiResponse<T>> {
		return this.request<T>(apiName, endpointName, "DELETE", opts);
	}
}

// Singleton export
export const api = ApiManager.getInstance();
