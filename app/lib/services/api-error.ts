export default class ApiError extends Error {
	status: number;

	constructor(message: string, status = 500) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}

	static notFound(message: string) {
		return new ApiError(message, 404);
	}

	static badRequest(message: string) {
		return new ApiError(message, 400);
	}

	static unauthorized(message = "No autorizado") {
		return new ApiError(message, 401);
	}

	static forbidden(message = "Sin permisos") {
		return new ApiError(message, 403);
	}

	static internal(message: string) {
		return new ApiError(message, 500);
	}

	static custom(message: string, status: number) {
		return new ApiError(message, status);
	}
}
