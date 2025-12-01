/**
 * Servicio de Pagos
 * Este servicio maneja el procesamiento y confirmación de pagos
 * Base URL: https://waldoz-001-site1.stempurl.com/api/pagos
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/pagos";

const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => ({
	"Content-Type": "application/json",
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

// ==================== TIPOS ====================

export interface SimularPagoResponse {
	success: boolean;
	message: string;
	codigoPago?: string;
	montoTotal?: number;
}

export interface ConfirmacionPagoDto {
	transaccionID: string;
	codigoPago: string;
	estado: string; // "approved", "rejected", "pending"
	proveedor: string; // "Stripe", "MercadoPago", etc.
	montoConfirmado: number;
}

export interface ConfirmacionPagoResponse {
	success: boolean;
	message: string;
	codigoPago: string;
	transaccionId: string;
}

// ==================== FUNCIONES ====================

/**
 * POST /api/pagos/simular
 * Simula el procesamiento de un pago
 * Este es un método de desarrollo/testing
 */
const simularPago = async (codigoPago: string): Promise<SimularPagoResponse> => {
	const response = await fetch(`${BASE_URL}/simular`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ codigoPago }),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Error al procesar el pago" }));
		throw new Error(error?.message || "Error al procesar el pago");
	}

	return response.json();
};

/**
 * POST /api/pagos/confirmacion
 * Webhook para confirmar el resultado de una transacción de pago
 * Al recibir confirmación, actualiza el estado de los boletos a "Pagado"
 */
const confirmarPago = async (data: ConfirmacionPagoDto): Promise<ConfirmacionPagoResponse> => {
	const response = await fetch(`${BASE_URL}/confirmacion`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Error al confirmar el pago" }));
		throw new Error(error?.message || "Error al confirmar el pago");
	}

	return response.json();
};

export default {
	simularPago,
	confirmarPago,
};
