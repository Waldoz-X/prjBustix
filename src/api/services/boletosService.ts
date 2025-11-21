/**
 * Servicio de API para gestión de boletos
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Boletos
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Boletos";

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

export interface CalcularPrecioDto {
	viajeID: number;
	codigoViaje: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	precioBase: number;
	cargoServicio: number;
	descuento: number;
	descuentoPorcentaje: number;
	subtotal: number;
	iva: number;
	precioTotal: number;
	cuponAplicado: string;
	paradaAbordaje: string;
	ventasAbiertas: boolean;
	asientosDisponibles: number;
}

export interface BoletoDto {
	boletoID: number;
	codigoBoleto: string;
	codigoQR: string;
	viajeID: number;
	codigoViaje: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	numeroAsiento: string;
	nombrePasajero: string;
	emailPasajero: string;
	telefonoPasajero: string;
	precioBase: number;
	descuento: number;
	cargoServicio: number;
	iva: number;
	precioTotal: number;
	estatus: number;
	estatusNombre: string;
	fechaCompra: string;
	fechaValidacion: string;
	paradaAbordaje: string;
	horaEstimadaAbordaje: string;
}

export interface CancelarBoletoDto {
	motivo: string;
}

export interface CambiarAsientoDto {
	nuevoAsiento: string;
}

export interface ValidarBoletoByIdDto {
	codigoQR: string;
	latitud: number;
	longitud: number;
	observaciones?: string;
}

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
	success: boolean;
	message: string;
	validacionID: number;
	resultado: string;
	fechaHoraValidacion: string;
	boletoID: number;
	clienteNombre: string;
	asientoAsignado: string;
	estadoBoleto: string;
}

export interface CheckinBoletoDto {
	observaciones?: string;
	latitud: number;
	longitud: number;
}

export interface CalcularPrecioParams {
	viajeId: number;
	paradaAbordajeId?: number;
	cuponId?: number;
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Boletos/calcular-precio
 * Calcular precio de un boleto con descuentos y cargos
 */
const calcularPrecio = async (params: CalcularPrecioParams): Promise<CalcularPrecioDto> => {
	console.log("[BoletosService] Calculating precio with params:", params);

	if (!params.viajeId || params.viajeId <= 0) {
		throw { status: 400, message: "El ID del viaje es requerido.", details: { field: "viajeId" } };
	}

	const queryParams = new URLSearchParams();
	queryParams.append("viajeId", params.viajeId.toString());
	if (params.paradaAbordajeId !== undefined) queryParams.append("paradaAbordajeId", params.paradaAbordajeId.toString());
	if (params.cuponId !== undefined) queryParams.append("cuponId", params.cuponId.toString());

	const response = await fetch(`${BASE_URL}/calcular-precio?${queryParams}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Boletos/{id}
 * Obtener un boleto por ID
 */
const getBoletoById = async (id: number): Promise<BoletoDto> => {
	console.log("[BoletosService] Fetching boleto by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Boletos/me/boletos
 * Obtener boletos del usuario actual
 */
const getMisBoletos = async (): Promise<BoletoDto[]> => {
	console.log("[BoletosService] Fetching mis boletos");

	const response = await fetch(`${BASE_URL}/me/boletos`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Boletos/verificar/{codigoBoleto}
 * Verificar validez de un boleto por código
 */
const verificarBoleto = async (codigoBoleto: string): Promise<any> => {
	console.log("[BoletosService] Verifying boleto:", codigoBoleto);

	if (!codigoBoleto || codigoBoleto.trim() === "") {
		throw { status: 400, message: "El código del boleto es requerido.", details: { field: "codigoBoleto" } };
	}

	const response = await fetch(`${BASE_URL}/verificar/${encodeURIComponent(codigoBoleto)}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Boletos/{id}/cancelar
 * Cancelar un boleto
 */
const cancelarBoleto = async (id: number, payload: CancelarBoletoDto): Promise<void> => {
	console.log("[BoletosService] Canceling boleto:", id, payload);

	if (!payload || typeof payload !== "object") {
		console.error("[BoletosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.motivo || payload.motivo.trim() === "") {
		throw { status: 400, message: "El motivo de cancelación es requerido.", details: { field: "motivo" } };
	}

	const response = await fetch(`${BASE_URL}/${id}/cancelar`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * PUT /api/Boletos/{id}/cambiar-asiento
 * Cambiar asiento de un boleto
 */
const cambiarAsiento = async (id: number, payload: CambiarAsientoDto): Promise<void> => {
	console.log("[BoletosService] Changing asiento for boleto:", id, payload);

	if (!payload || typeof payload !== "object") {
		console.error("[BoletosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.nuevoAsiento || payload.nuevoAsiento.trim() === "") {
		throw { status: 400, message: "El nuevo asiento es requerido.", details: { field: "nuevoAsiento" } };
	}

	const response = await fetch(`${BASE_URL}/${id}/cambiar-asiento`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * POST /api/Boletos/{id}/validar
 * Validar un boleto por ID
 */
const validarBoletoById = async (id: number, payload: ValidarBoletoByIdDto): Promise<void> => {
	console.log("[BoletosService] Validating boleto by ID:", id, payload);

	if (!payload || typeof payload !== "object") {
		console.error("[BoletosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.codigoQR || payload.codigoQR.trim() === "") {
		throw { status: 400, message: "El código QR es requerido.", details: { field: "codigoQR" } };
	}

	if (typeof payload.latitud !== "number" || payload.latitud < -90 || payload.latitud > 90) {
		throw {
			status: 400,
			message: "La latitud debe ser un número entre -90 y 90.",
			details: { field: "latitud" },
		};
	}

	if (typeof payload.longitud !== "number" || payload.longitud < -180 || payload.longitud > 180) {
		throw {
			status: 400,
			message: "La longitud debe ser un número entre -180 y 180.",
			details: { field: "longitud" },
		};
	}

	const response = await fetch(`${BASE_URL}/${id}/validar`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * POST /api/Boletos/validar
 * Validar un boleto por código QR (endpoint principal de validación)
 */
const validarBoleto = async (payload: ValidarBoletoDto): Promise<ValidacionResultDto> => {
	console.log("[BoletosService] Validating boleto:", payload);

	if (!payload || typeof payload !== "object") {
		console.error("[BoletosService] Payload inválido:", payload);
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

	if (typeof payload.estacionLat !== "number" || payload.estacionLat < -90 || payload.estacionLat > 90) {
		throw {
			status: 400,
			message: "La latitud de la estación debe ser un número entre -90 y 90.",
			details: { field: "estacionLat" },
		};
	}

	if (typeof payload.estacionLong !== "number" || payload.estacionLong < -180 || payload.estacionLong > 180) {
		throw {
			status: 400,
			message: "La longitud de la estación debe ser un número entre -180 y 180.",
			details: { field: "estacionLong" },
		};
	}

	const response = await fetch(`${BASE_URL}/validar`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Boletos/{id}/checkin
 * Realizar check-in de un boleto
 */
const checkinBoleto = async (id: number, payload: CheckinBoletoDto): Promise<void> => {
	console.log("[BoletosService] Check-in boleto:", id, payload);

	if (!payload || typeof payload !== "object") {
		console.error("[BoletosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (typeof payload.latitud !== "number" || payload.latitud < -90 || payload.latitud > 90) {
		throw {
			status: 400,
			message: "La latitud debe ser un número entre -90 y 90.",
			details: { field: "latitud" },
		};
	}

	if (typeof payload.longitud !== "number" || payload.longitud < -180 || payload.longitud > 180) {
		throw {
			status: 400,
			message: "La longitud debe ser un número entre -180 y 180.",
			details: { field: "longitud" },
		};
	}

	const response = await fetch(`${BASE_URL}/${id}/checkin`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

const boletosService = {
	calcularPrecio,
	getBoletoById,
	getMisBoletos,
	verificarBoleto,
	cancelarBoleto,
	cambiarAsiento,
	validarBoletoById,
	validarBoleto,
	checkinBoleto,
};

export default boletosService;
