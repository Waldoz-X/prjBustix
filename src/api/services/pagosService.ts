/**
 * Servicio de API para gestión de pagos
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Pagos
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Pagos";

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

export interface ConfirmacionPagoDto {
	transaccionID: string;
	codigoPago: string;
	estado: string;
	proveedor: string;
	montoConfirmado: number;
	metadataAdicional?: Record<string, string>;
}

export interface PagoDto {
	pagoID: number;
	codigoPago: string;
	transaccionID: string;
	monto: number;
	metodoPago: string;
	proveedor: string;
	estatus: number;
	estatusNombre: string;
	fechaPago: string;
	boletosIDs: number[];
}

// ==================== FUNCIONES ====================

/**
 * POST /api/Pagos/confirmacion
 * Confirmar un pago realizado externamente
 */
const confirmarPago = async (payload: ConfirmacionPagoDto): Promise<void> => {
	console.log("[PagosService] Confirming pago:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[PagosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.transaccionID || payload.transaccionID.trim() === "") {
		throw { status: 400, message: "El ID de transacción es requerido.", details: { field: "transaccionID" } };
	}

	if (!payload.codigoPago || payload.codigoPago.trim() === "") {
		throw { status: 400, message: "El código de pago es requerido.", details: { field: "codigoPago" } };
	}

	if (!payload.estado || payload.estado.trim() === "") {
		throw { status: 400, message: "El estado del pago es requerido.", details: { field: "estado" } };
	}

	if (!payload.proveedor || payload.proveedor.trim() === "") {
		throw { status: 400, message: "El proveedor es requerido.", details: { field: "proveedor" } };
	}

	if (typeof payload.montoConfirmado !== "number" || payload.montoConfirmado <= 0) {
		throw {
			status: 400,
			message: "El monto confirmado debe ser un número mayor a 0.",
			details: { field: "montoConfirmado" },
		};
	}

	const response = await fetch(`${BASE_URL}/confirmacion`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * GET /api/Pagos/{codigoPago}
 * Obtener información de un pago por su código
 */
const getPagoByCodigo = async (codigoPago: string): Promise<PagoDto> => {
	console.log("[PagosService] Fetching pago by codigo:", codigoPago);

	if (!codigoPago || codigoPago.trim() === "") {
		throw { status: 400, message: "El código de pago es requerido.", details: { field: "codigoPago" } };
	}

	const response = await fetch(`${BASE_URL}/${encodeURIComponent(codigoPago)}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Pagos/simular-pago
 * Simular un pago para pruebas (solo desarrollo/staging)
 * @param codigoPago - Código del pago a simular
 */
const simularPago = async (codigoPago: string): Promise<void> => {
	console.log("[PagosService] Simulating pago:", codigoPago);

	if (!codigoPago || codigoPago.trim() === "") {
		throw { status: 400, message: "El código de pago es requerido.", details: { field: "codigoPago" } };
	}

	const response = await fetch(`${BASE_URL}/simular-pago`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(codigoPago),
	});

	await handleResponse(response);
};

/**
 * GET /api/Pagos/me/historial
 * Obtener historial de pagos del usuario actual
 */
const getHistorialPagos = async (): Promise<PagoDto[]> => {
	console.log("[PagosService] Fetching historial pagos for current user");

	const response = await fetch(`${BASE_URL}/me/historial`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

const pagosService = {
	confirmarPago,
	getPagoByCodigo,
	simularPago,
	getHistorialPagos,
};

export default pagosService;
