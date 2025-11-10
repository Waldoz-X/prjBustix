/**
 * Manejo seguro de errores - No expone detalles sensibles al usuario
 */

export enum ErrorType {
	AUTHENTICATION = "AUTHENTICATION",
	NETWORK = "NETWORK",
	VALIDATION = "VALIDATION",
	SERVER = "SERVER",
	UNKNOWN = "UNKNOWN",
	RATE_LIMIT = "RATE_LIMIT",
}

export interface SafeError {
	type: ErrorType;
	userMessage: string;
	technicalMessage?: string; // Solo para logs
	code?: string;
}

/**
 * Convierte errores del sistema en mensajes seguros para el usuario
 */
export function handleApiError(error: any): SafeError {
	// Log completo del error para debugging (solo en desarrollo)
	if (import.meta.env.DEV) {
		console.error("[API Error]", error);
	}

	// Error de red
	if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
		return {
			type: ErrorType.NETWORK,
			userMessage: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
			technicalMessage: error.message,
		};
	}

	// Error de autenticación (401)
	if (error.status === 401 || error.message?.includes("Credenciales inválidas")) {
		return {
			type: ErrorType.AUTHENTICATION,
			userMessage: "Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.",
			technicalMessage: error.message,
			code: "AUTH_FAILED",
		};
	}

	// Error de validación (400)
	if (error.status === 400) {
		return {
			type: ErrorType.VALIDATION,
			userMessage: "Los datos ingresados no son válidos. Por favor, revisa la información.",
			technicalMessage: error.message,
			code: "VALIDATION_ERROR",
		};
	}

	// Error del servidor (500, 502, 503, etc)
	if (error.status >= 500) {
		return {
			type: ErrorType.SERVER,
			userMessage: "Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.",
			technicalMessage: error.message,
			code: "SERVER_ERROR",
		};
	}

	// Error de timeout
	if (error.message?.includes("timeout")) {
		return {
			type: ErrorType.NETWORK,
			userMessage: "La solicitud tardó demasiado. Por favor, intenta nuevamente.",
			technicalMessage: error.message,
			code: "TIMEOUT",
		};
	}

	// Error desconocido - mensaje genérico seguro
	return {
		type: ErrorType.UNKNOWN,
		userMessage: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
		technicalMessage: error.message || "Unknown error",
		code: "UNKNOWN_ERROR",
	};
}

/**
 * Logger seguro de errores (puede integrarse con servicios como Sentry)
 */
export function logError(error: SafeError, context?: Record<string, any>): void {
	// En producción, esto se enviaría a un servicio de logging
	if (import.meta.env.PROD) {
		// TODO: Integrar con servicio de logging (ej: Sentry, LogRocket)
		console.error("[Error Log]", {
			type: error.type,
			code: error.code,
			technical: error.technicalMessage,
			context,
			timestamp: new Date().toISOString(),
		});
	}
}

/**
 * Sanitiza datos antes de enviar logs (remueve información sensible)
 */
export function sanitizeForLog(data: any): any {
	if (!data) return data;

	const sensitiveKeys = ["password", "token", "accessToken", "refreshToken", "secret", "apiKey"];

	if (typeof data === "object") {
		const sanitized = { ...data };
		for (const key of sensitiveKeys) {
			if (key in sanitized) {
				sanitized[key] = "***REDACTED***";
			}
		}
		return sanitized;
	}

	return data;
}
