/**
 * Servicio de API para información del usuario actual (/me endpoints)
 * Base URL: https://waldoz-001-site1.stempurl.com/api/me
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/me";

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

export interface MisBoletosFiltros {
	estatus?: string;
	soloActivos?: boolean;
}

export interface MiBoletoDto {
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

export interface UpdatePerfilDto {
	nombreCompleto: string;
	telefono: string;
	direccion?: string;
	ciudad?: string;
	estado?: string;
	codigoPostal?: string;
	urlFotoPerfil?: string;
	notificacionesPush?: boolean;
	notificacionesEmail?: boolean;
}

export interface CambiarPasswordDto {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

export interface MisNotificacionesFiltros {
	soloNoLeidas?: boolean;
	tipo?: string;
	pagina?: number;
	tamanoPagina?: number;
}

// Los tipos de respuesta para perfil y estadísticas dependerán del backend
export type MiPerfilDto = any;
export type MisEstadisticasDto = any;
export type MisNotificacionesDto = any;

// ==================== FUNCIONES ====================

/**
 * GET /api/me/boletos
 * Obtener boletos del usuario actual
 */
const getMisBoletos = async (filtros?: MisBoletosFiltros): Promise<MiBoletoDto[]> => {
	console.log("[MeService] Fetching mis boletos with filtros:", filtros);

	const queryParams = new URLSearchParams();
	if (filtros?.estatus) queryParams.append("estatus", filtros.estatus);
	if (filtros?.soloActivos !== undefined) queryParams.append("soloActivos", String(filtros.soloActivos));

	const url = queryParams.toString() ? `${BASE_URL}/boletos?${queryParams}` : `${BASE_URL}/boletos`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/me/perfil
 * Obtener perfil del usuario actual
 */
const getMiPerfil = async (): Promise<MiPerfilDto> => {
	console.log("[MeService] Fetching mi perfil");

	const response = await fetch(`${BASE_URL}/perfil`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/me/perfil
 * Actualizar perfil del usuario actual
 */
const updateMiPerfil = async (payload: UpdatePerfilDto): Promise<void> => {
	console.log("[MeService] Updating mi perfil:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[MeService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.nombreCompleto || payload.nombreCompleto.trim() === "") {
		throw { status: 400, message: "El nombre completo es requerido.", details: { field: "nombreCompleto" } };
	}

	if (!payload.telefono || payload.telefono.trim() === "") {
		throw { status: 400, message: "El teléfono es requerido.", details: { field: "telefono" } };
	}

	const response = await fetch(`${BASE_URL}/perfil`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * GET /api/me/estadisticas
 * Obtener estadísticas del usuario actual
 */
const getMisEstadisticas = async (): Promise<MisEstadisticasDto> => {
	console.log("[MeService] Fetching mis estadisticas");

	const response = await fetch(`${BASE_URL}/estadisticas`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/me/notificaciones
 * Obtener notificaciones del usuario actual
 */
const getMisNotificaciones = async (filtros?: MisNotificacionesFiltros): Promise<MisNotificacionesDto> => {
	console.log("[MeService] Fetching mis notificaciones with filtros:", filtros);

	const queryParams = new URLSearchParams();
	if (filtros?.soloNoLeidas !== undefined) queryParams.append("soloNoLeidas", String(filtros.soloNoLeidas));
	if (filtros?.tipo) queryParams.append("tipo", filtros.tipo);
	if (filtros?.pagina !== undefined) queryParams.append("pagina", String(filtros.pagina));
	if (filtros?.tamanoPagina !== undefined) queryParams.append("tamanoPagina", String(filtros.tamanoPagina));

	const url = queryParams.toString() ? `${BASE_URL}/notificaciones?${queryParams}` : `${BASE_URL}/notificaciones`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/me/cambiar-password
 * Cambiar contraseña del usuario actual
 */
const cambiarPassword = async (payload: CambiarPasswordDto): Promise<void> => {
	console.log("[MeService] Changing password");

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[MeService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.currentPassword || payload.currentPassword.trim() === "") {
		throw { status: 400, message: "La contraseña actual es requerida.", details: { field: "currentPassword" } };
	}

	if (!payload.newPassword || payload.newPassword.trim() === "") {
		throw { status: 400, message: "La nueva contraseña es requerida.", details: { field: "newPassword" } };
	}

	if (!payload.confirmNewPassword || payload.confirmNewPassword.trim() === "") {
		throw {
			status: 400,
			message: "La confirmación de contraseña es requerida.",
			details: { field: "confirmNewPassword" },
		};
	}

	if (payload.newPassword !== payload.confirmNewPassword) {
		throw {
			status: 400,
			message: "Las contraseñas no coinciden.",
			details: { fields: ["newPassword", "confirmNewPassword"] },
		};
	}

	if (payload.newPassword.length < 6) {
		throw {
			status: 400,
			message: "La nueva contraseña debe tener al menos 6 caracteres.",
			details: { field: "newPassword" },
		};
	}

	const response = await fetch(`${BASE_URL}/cambiar-password`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * DELETE /api/me
 * Eliminar cuenta del usuario actual
 */
const eliminarMiCuenta = async (): Promise<void> => {
	console.log("[MeService] Deleting mi cuenta");

	const response = await fetch(BASE_URL, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

const meService = {
	getMisBoletos,
	getMiPerfil,
	updateMiPerfil,
	getMisEstadisticas,
	getMisNotificaciones,
	cambiarPassword,
	eliminarMiCuenta,
};

export default meService;
