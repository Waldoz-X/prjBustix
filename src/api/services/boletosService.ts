import type { BoletoResponseDto, CalculoPrecioDto, IniciarCompraDto, IniciarCompraResponseDto } from "@/types/boletos";

// Tipos auxiliares para endpoints faltantes
type CambiarAsientoDto = { nuevoAsiento: string };
type CambiarAsientoResponse = {
	success: boolean;
	message: string;
	asientoAnterior: string;
	asientoNuevo: string;
};

type ValidarBoletoDto = {
	codigoQR: string;
	latitud: number;
	longitud: number;
	observaciones?: string;
};
type ValidarBoletoResponseDto = {
	success: boolean;
	data: {
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
	};
};

type ValidacionDto = {
	viajeID: number;
	codigoQR: string;
	tipoValidacion: string;
	estacionLat: number;
	estacionLong: number;
	observaciones?: string;
	deviceValidationId?: string;
};
type ValidacionResponseDto = {
	success: boolean;
	message: string;
	validacionID: number;
	resultado: string;
	fechaHoraValidacion: string;
	boletoID: number;
	clienteNombre: string;
	asientoAsignado: string;
	estadoBoleto: string;
};

type CheckInDto = {
	observaciones?: string;
	latitud?: number;
	longitud?: number;
};
type CheckInResponseDto = {
	success: boolean;
	message: string;
	boletoId: number;
	fechaCheckIn: string;
	clienteNombre: string;
	numeroAsiento: string;
};
/**
 * Cambia el asiento de un boleto
 * Endpoint: PUT /api/boletos/{id}/cambiar-asiento
 */
const cambiarAsiento = async (id: number, dto: CambiarAsientoDto): Promise<CambiarAsientoResponse> => {
	const response = await fetch(`${BASE_URL}/${id}/cambiar-asiento`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(dto),
	});
	if (!response.ok) throw new Error("Error al cambiar asiento");
	return response.json();
};

/**
 * Valida un boleto por ID y QR (marca como usado)
 * Endpoint: POST /api/boletos/{id}/validar
 */
const validarBoletoPorId = async (id: number, dto: ValidarBoletoDto): Promise<ValidarBoletoResponseDto> => {
	const response = await fetch(`${BASE_URL}/${id}/validar`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(dto),
	});
	if (!response.ok) throw new Error("Error al validar boleto");
	return response.json();
};

/**
 * Valida un boleto por QR (principal para staff)
 * Endpoint: POST /api/boletos/validar
 */
const validarBoletoPorQR = async (dto: ValidacionDto): Promise<ValidacionResponseDto> => {
	const response = await fetch(`${BASE_URL}/validar`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(dto),
	});
	if (!response.ok) throw new Error("Error al validar boleto por QR");
	return response.json();
};

/**
 * Realiza check-in de pasajero
 * Endpoint: POST /api/boletos/{id}/checkin
 */
const checkinBoleto = async (id: number, dto?: CheckInDto): Promise<CheckInResponseDto> => {
	const response = await fetch(`${BASE_URL}/${id}/checkin`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(dto || {}),
	});
	if (!response.ok) throw new Error("Error al hacer check-in");
	return response.json();
};

// Constants and helpers
const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/boletos";

const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => ({
	"Content-Type": "application/json",
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

async function parseResponseSafe(response: Response): Promise<any> {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

// Service functions

/**
 * Calcula el precio de un boleto antes de comprarlo
 * Usa el endpoint GET /api/boletos/calcular-precio
 */
const calcularPrecio = async (
	viajeId: number,
	paradaAbordajeId?: number,
	cuponId?: number,
): Promise<CalculoPrecioDto> => {
	const params = new URLSearchParams();
	params.append("viajeId", viajeId.toString());
	if (paradaAbordajeId) params.append("paradaAbordajeId", paradaAbordajeId.toString());
	if (cuponId) params.append("cuponId", cuponId.toString());
	const response = await fetch(`${BASE_URL}/calcular-precio?${params.toString()}`, {
		method: "GET",
		headers: getHeaders(),
	});
	if (!response.ok) {
		const error = await parseResponseSafe(response);
		throw new Error(error?.message || "Error al calcular precio");
	}
	return response.json();
};

/**
 * Inicia el proceso de compra de boletos (reserva y genera código de pago)
 * Usa el endpoint POST /api/boletos/iniciar-compra
 * Este endpoint REQUIERE autenticación (Bearer token)
 */
const iniciarCompra = async (data: IniciarCompraDto): Promise<IniciarCompraResponseDto> => {
	try {
		console.log("🔵 URL:", `${BASE_URL}/iniciar-compra`);
		console.log("🔵 Datos recibidos:", JSON.stringify(data, null, 2));

		const token = getToken();
		console.log("🔵 Token:", token ? `${token.substring(0, 20)}...` : "NO HAY TOKEN");

		const headers = {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		};

		// Construir el payload asegurando que cuponID sea null si no existe
		const payload = {
			viajeID: data.viajeID,
			paradaAbordajeID: data.paradaAbordajeID,
			cuponID: data.cuponID,
			pasajeros: data.pasajeros,
		};

		console.log("🔵 Payload a enviar:", JSON.stringify(payload, null, 2));

		const response = await fetch(`${BASE_URL}/iniciar-compra`, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(payload),
		});

		console.log("🔵 Response status:", response.status);
		console.log("🔵 Response headers:", Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			const errorText = await response.text();
			console.error("🔴 Error response body:", errorText);

			let errorMessage = `Error ${response.status}: ${response.statusText}`;
			try {
				const errorJson = JSON.parse(errorText);
				console.error("🔴 Error JSON:", errorJson);
				errorMessage = errorJson.message || errorJson.title || errorJson.error || errorMessage;
			} catch {
				errorMessage = errorText || errorMessage;
			}

			throw new Error(errorMessage);
		}

		const result = await response.json();
		console.log("✅ Respuesta exitosa:", result);
		return result;
	} catch (error: any) {
		console.error("🔴 Error completo en iniciarCompra:", error);

		if (error instanceof TypeError && error.message === "Failed to fetch") {
			throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté funcionando.");
		}

		throw error;
	}
};

/**
 * Compra uno o varios boletos
 * Usa el endpoint POST /api/boletos
 */
const comprarBoletos = async (data: any): Promise<any> => {
	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const error = await parseResponseSafe(response);
		throw new Error(error?.message || "Error al comprar boleto");
	}
	return response.json();
};

/**
 * Obtiene los boletos del usuario autenticado
 * Usa el endpoint GET /api/boletos/me/boletos
 */
const misBoletos = async (): Promise<{ success: boolean; data: BoletoResponseDto[]; total: number }> => {
	const response = await fetch(`${BASE_URL}/me/boletos`, {
		method: "GET",
		headers: getHeaders(),
	});
	if (!response.ok) throw new Error("Error al obtener boletos del usuario");
	return response.json();
};

/**
 * Obtiene un boleto específico por ID
 * Usa el endpoint GET /api/boletos/{id}
 */
const obtenerBoleto = async (id: number): Promise<BoletoResponseDto> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});
	if (!response.ok) throw new Error("Error al obtener boleto");
	return response.json();
};

/**
 * Verifica la validez de un boleto (solo staff/admin)
 * Usa el endpoint GET /api/boletos/verificar/{codigoBoleto}
 */
const verificarBoleto = async (
	codigoBoleto: string,
): Promise<{
	success: boolean;
	esValido: boolean;
	data: any;
}> => {
	const response = await fetch(`${BASE_URL}/verificar/${codigoBoleto}`, {
		method: "GET",
		headers: getHeaders(),
	});
	if (!response.ok) throw new Error("Error al verificar boleto");
	return response.json();
};

/**
 * Cancelar un boleto y procesar reembolso
 * Usa el endpoint PUT /api/boletos/{id}/cancelar
 */
const cancelarBoleto = async (
	id: number,
	dto: { motivo: string },
): Promise<{
	success: boolean;
	message: string;
	montoReembolso: number;
	porcentajeReembolso: number;
	tiempoEstimadoReembolso: string;
}> => {
	const response = await fetch(`${BASE_URL}/${id}/cancelar`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(dto),
	});
	if (!response.ok) throw new Error("Error al cancelar boleto");
	return response.json();
};

export default {
	calcularPrecio,
	comprarBoletos,
	iniciarCompra,
	misBoletos,
	obtenerBoleto,
	verificarBoleto,
	cancelarBoleto,
	cambiarAsiento,
	validarBoletoPorId,
	validarBoletoPorQR,
	checkinBoleto,
};
