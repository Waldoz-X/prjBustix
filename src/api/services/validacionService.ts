/**
 * Servicio de API para validación de boletos
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Validacion
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Validacion";

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

export interface ValidarBoletoDto {
	viajeID: number;
	codigoQR: string;
	tipoValidacion: string;
	estacionLat: number;
	estacionLong: number;
	observaciones?: string;
	deviceValidationId?: string;
}

export interface ValidacionResultDto {
	esValido: boolean;
	mensaje: string;
	boletoID: number;
	nombrePasajero: string;
	numeroAsiento: string;
	codigoViaje: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	fechaValidacion: string;
	validadoPor: string;
}

// ==================== FUNCIONES ====================

/**
 * POST /api/Validacion
 * Validar un boleto mediante código QR
 */
const validarBoleto = async (payload: ValidarBoletoDto): Promise<ValidacionResultDto> => {
	console.log("[ValidacionService] Validating boleto with payload:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[ValidacionService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.viajeID || payload.viajeID <= 0) {
		throw { status: 400, message: "El ID del viaje es requerido.", details: { field: "viajeID" } };
	}

	if (!payload.codigoQR || payload.codigoQR.trim() === "") {
		throw { status: 400, message: "El código QR es requerido.", details: { field: "codigoQR" } };
	}

	if (!payload.tipoValidacion || payload.tipoValidacion.trim() === "") {
		throw { status: 400, message: "El tipo de validación es requerido.", details: { field: "tipoValidacion" } };
	}

	// Validar coordenadas
	if (typeof payload.estacionLat !== "number" || payload.estacionLat < -90 || payload.estacionLat > 90) {
		throw {
			status: 400,
			message: "La latitud debe estar entre -90 y 90.",
			details: { field: "estacionLat" },
		};
	}

	if (typeof payload.estacionLong !== "number" || payload.estacionLong < -180 || payload.estacionLong > 180) {
		throw {
			status: 400,
			message: "La longitud debe estar entre -180 y 180.",
			details: { field: "estacionLong" },
		};
	}

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

const validacionService = {
	validarBoleto,
};

export default validacionService;
