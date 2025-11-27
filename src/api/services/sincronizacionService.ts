/**
 * Servicio de API para sincronización de datos offline
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Sincronizacion
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Sincronizacion";

/**
 * Obtener el token de autenticación del localStorage
 */
const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => {
	const token = getToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
};

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		let parsed: any;
		try {
			parsed = await response.json();
		} catch (_e) {
			try {
				parsed = { title: await response.text() };
			} catch {
				parsed = null;
			}
		}
		console.error("API Error:", parsed || response.statusText);
		throw {
			status: response.status,
			statusText: response.statusText,
			...(parsed || {}),
		};
	}
	const text = await response.text();
	return text ? JSON.parse(text) : null;
};

// ==================== TIPOS ====================

export interface ValidacionOfflineDto {
	boletoID: number;
	viajeID: number;
	fechaHoraValidacion: string;
	resultado: string;
	tipoValidacion: string;
	estacionLat: number;
	estacionLong: number;
	observaciones?: string;
	deviceValidationId?: string;
	deviceId?: string;
}

export interface ErrorSincronizacionDto {
	deviceValidationId: string;
	boletoID: number;
	error: string;
}

export interface SincronizacionResultDto {
	success: boolean;
	message: string;
	totalRecibidas: number;
	procesadas: number;
	fallidas: number;
	duplicadas: number;
	errores: ErrorSincronizacionDto[];
}

// ==================== FUNCIONES ====================

/**
 * POST /api/Sincronizacion/validaciones
 * Sincronizar validaciones offline con el servidor
 * @param validaciones - Array de validaciones realizadas offline
 */
const sincronizarValidaciones = async (validaciones: ValidacionOfflineDto[]): Promise<SincronizacionResultDto> => {
	console.log("[SincronizacionService] Syncing validaciones:", validaciones.length);

	// Validaciones cliente
	if (!Array.isArray(validaciones)) {
		console.error("[SincronizacionService] Payload debe ser un array:", validaciones);
		throw { status: 400, message: "El payload debe ser un array de validaciones", details: { validaciones } };
	}

	if (validaciones.length === 0) {
		console.warn("[SincronizacionService] Array de validaciones vacío");
		return {
			success: true,
			message: "No hay validaciones para sincronizar",
			totalRecibidas: 0,
			procesadas: 0,
			fallidas: 0,
			duplicadas: 0,
			errores: [],
		};
	}

	// Validar cada validación
	for (let i = 0; i < validaciones.length; i++) {
		const val = validaciones[i];

		if (!val.boletoID || val.boletoID <= 0) {
			throw {
				status: 400,
				message: `Validación ${i}: El ID del boleto es requerido.`,
				details: { index: i, field: "boletoID" },
			};
		}

		if (!val.viajeID || val.viajeID <= 0) {
			throw {
				status: 400,
				message: `Validación ${i}: El ID del viaje es requerido.`,
				details: { index: i, field: "viajeID" },
			};
		}

		if (!val.fechaHoraValidacion) {
			throw {
				status: 400,
				message: `Validación ${i}: La fecha/hora de validación es requerida.`,
				details: { index: i, field: "fechaHoraValidacion" },
			};
		}

		if (!val.tipoValidacion || val.tipoValidacion.trim() === "") {
			throw {
				status: 400,
				message: `Validación ${i}: El tipo de validación es requerido.`,
				details: { index: i, field: "tipoValidacion" },
			};
		}

		// Validar coordenadas
		if (typeof val.estacionLat !== "number" || val.estacionLat < -90 || val.estacionLat > 90) {
			throw {
				status: 400,
				message: `Validación ${i}: La latitud debe estar entre -90 y 90.`,
				details: { index: i, field: "estacionLat" },
			};
		}

		if (typeof val.estacionLong !== "number" || val.estacionLong < -180 || val.estacionLong > 180) {
			throw {
				status: 400,
				message: `Validación ${i}: La longitud debe estar entre -180 y 180.`,
				details: { index: i, field: "estacionLong" },
			};
		}
	}

	const response = await fetch(`${BASE_URL}/validaciones`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(validaciones),
	});

	return await handleResponse(response);
};

const sincronizacionService = {
	sincronizarValidaciones,
};

export default sincronizacionService;
