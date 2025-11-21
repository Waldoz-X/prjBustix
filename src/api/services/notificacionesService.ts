/**
 * Servicio de API para gestión de notificaciones
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Notificaciones
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Notificaciones";

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

export interface BroadcastNotificacionDto {
	titulo: string;
	mensaje: string;
	tipoNotificacion: string;
	viajeID?: number;
	roles?: string[];
	usuariosIDs?: string[];
	enviarPush?: boolean;
	enviarEmail?: boolean;
}

export interface CreateNotificacionDto {
	usuarioID: string;
	titulo: string;
	mensaje: string;
	tipoNotificacion: string;
	viajeID?: number;
	boletoID?: number;
	enviarPush?: boolean;
	enviarEmail?: boolean;
}

export interface NotificacionDto {
	notificacionID: number;
	titulo: string;
	mensaje: string;
	tipoNotificacion: string;
	viajeID: number;
	codigoViaje: string;
	boletoID: number;
	codigoBoleto: string;
	fueEnviada: boolean;
	fechaEnvio: string;
	fueLeida: boolean;
	fechaLectura: string;
	fechaCreacion: string;
}

export interface MisNotificacionesParams {
	soloNoLeidas?: boolean;
	pagina?: number;
	porPagina?: number;
}

// ==================== FUNCIONES ====================

/**
 * POST /api/Notificaciones/broadcast
 * Enviar notificación masiva a múltiples usuarios/roles
 */
const enviarBroadcast = async (payload: BroadcastNotificacionDto): Promise<void> => {
	console.log("[NotificacionesService] Sending broadcast notification:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[NotificacionesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.titulo || payload.titulo.trim() === "") {
		throw { status: 400, message: "El título es requerido.", details: { field: "titulo" } };
	}

	if (!payload.mensaje || payload.mensaje.trim() === "") {
		throw { status: 400, message: "El mensaje es requerido.", details: { field: "mensaje" } };
	}

	if (!payload.tipoNotificacion || payload.tipoNotificacion.trim() === "") {
		throw { status: 400, message: "El tipo de notificación es requerido.", details: { field: "tipoNotificacion" } };
	}

	// Validar que al menos haya roles o usuarios especificados
	const hasRoles = payload.roles && payload.roles.length > 0;
	const hasUsuarios = payload.usuariosIDs && payload.usuariosIDs.length > 0;

	if (!hasRoles && !hasUsuarios) {
		throw {
			status: 400,
			message: "Debe especificar al menos un rol o un usuario destinatario.",
			details: { fields: ["roles", "usuariosIDs"] },
		};
	}

	const response = await fetch(`${BASE_URL}/broadcast`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * POST /api/Notificaciones
 * Crear una notificación para un usuario específico
 */
const crearNotificacion = async (payload: CreateNotificacionDto): Promise<NotificacionDto> => {
	console.log("[NotificacionesService] Creating notification:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[NotificacionesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.usuarioID || payload.usuarioID.trim() === "") {
		throw { status: 400, message: "El ID del usuario es requerido.", details: { field: "usuarioID" } };
	}

	if (!payload.titulo || payload.titulo.trim() === "") {
		throw { status: 400, message: "El título es requerido.", details: { field: "titulo" } };
	}

	if (!payload.mensaje || payload.mensaje.trim() === "") {
		throw { status: 400, message: "El mensaje es requerido.", details: { field: "mensaje" } };
	}

	if (!payload.tipoNotificacion || payload.tipoNotificacion.trim() === "") {
		throw { status: 400, message: "El tipo de notificación es requerido.", details: { field: "tipoNotificacion" } };
	}

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Notificaciones/me
 * Obtener notificaciones del usuario actual
 */
const getMisNotificaciones = async (params?: MisNotificacionesParams): Promise<NotificacionDto[]> => {
	console.log("[NotificacionesService] Fetching mis notificaciones with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.soloNoLeidas !== undefined) queryParams.append("soloNoLeidas", String(params.soloNoLeidas));
	if (params?.pagina !== undefined) queryParams.append("pagina", String(params.pagina));
	if (params?.porPagina !== undefined) queryParams.append("porPagina", String(params.porPagina));

	const url = queryParams.toString() ? `${BASE_URL}/me?${queryParams}` : `${BASE_URL}/me`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Notificaciones/{id}
 * Obtener una notificación por ID
 */
const getNotificacionById = async (id: number): Promise<NotificacionDto> => {
	console.log("[NotificacionesService] Fetching notificacion by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Notificaciones/{id}
 * Eliminar una notificación
 */
const deleteNotificacion = async (id: number): Promise<void> => {
	console.log("[NotificacionesService] Deleting notificacion:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * PUT /api/Notificaciones/{id}/leer
 * Marcar una notificación como leída
 */
const marcarComoLeida = async (id: number): Promise<void> => {
	console.log("[NotificacionesService] Marking notificacion as read:", id);

	const response = await fetch(`${BASE_URL}/${id}/leer`, {
		method: "PUT",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * PUT /api/Notificaciones/marcar-todas-leidas
 * Marcar todas las notificaciones del usuario como leídas
 */
const marcarTodasLeidas = async (): Promise<void> => {
	console.log("[NotificacionesService] Marking all notificaciones as read");

	const response = await fetch(`${BASE_URL}/marcar-todas-leidas`, {
		method: "PUT",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * GET /api/Notificaciones/no-leidas/count
 * Obtener el conteo de notificaciones no leídas
 */
const getCountNoLeidas = async (): Promise<number> => {
	console.log("[NotificacionesService] Fetching unread notifications count");

	const response = await fetch(`${BASE_URL}/no-leidas/count`, {
		method: "GET",
		headers: getHeaders(),
	});

	const count = await handleResponse(response);
	return typeof count === "number" ? count : 0;
};

const notificacionesService = {
	enviarBroadcast,
	crearNotificacion,
	getMisNotificaciones,
	getNotificacionById,
	deleteNotificacion,
	marcarComoLeida,
	marcarTodasLeidas,
	getCountNoLeidas,
};

export default notificacionesService;
