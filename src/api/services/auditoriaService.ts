/**
 * Servicio de API para auditoría del sistema
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Auditoria
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Auditoria";

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

export interface AuditoriaFiltros {
	tabla?: string;
	registroId?: string;
	usuarioId?: string;
	accion?: string;
	fechaDesde?: string;
	fechaHasta?: string;
	page?: number;
	pageSize?: number;
}

export interface EstadisticasAuditoriaParams {
	fechaDesde?: string;
	fechaHasta?: string;
}

// Los tipos de respuesta dependerán del backend
// Se pueden definir más específicamente cuando se conozca la estructura exacta
export type AuditoriaDto = any;
export type HistorialAuditoriaDto = any;
export type EstadisticasAuditoriaDto = any;

// ==================== FUNCIONES ====================

/**
 * GET /api/Auditoria
 * Obtener registros de auditoría con filtros
 */
const getAuditoria = async (filtros?: AuditoriaFiltros): Promise<AuditoriaDto> => {
	console.log("[AuditoriaService] Fetching auditoria with filtros:", filtros);

	const queryParams = new URLSearchParams();
	if (filtros?.tabla) queryParams.append("tabla", filtros.tabla);
	if (filtros?.registroId) queryParams.append("registroId", filtros.registroId);
	if (filtros?.usuarioId) queryParams.append("usuarioId", filtros.usuarioId);
	if (filtros?.accion) queryParams.append("accion", filtros.accion);
	if (filtros?.fechaDesde) queryParams.append("fechaDesde", filtros.fechaDesde);
	if (filtros?.fechaHasta) queryParams.append("fechaHasta", filtros.fechaHasta);
	if (filtros?.page !== undefined) queryParams.append("page", filtros.page.toString());
	if (filtros?.pageSize !== undefined) queryParams.append("pageSize", filtros.pageSize.toString());

	const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Auditoria/{tabla}/{registroId}
 * Obtener historial de auditoría de un registro específico
 */
const getHistorialRegistro = async (tabla: string, registroId: string): Promise<HistorialAuditoriaDto> => {
	console.log("[AuditoriaService] Fetching historial for tabla:", tabla, "registroId:", registroId);

	if (!tabla || tabla.trim() === "") {
		throw { status: 400, message: "El nombre de la tabla es requerido.", details: { field: "tabla" } };
	}

	if (!registroId || registroId.trim() === "") {
		throw { status: 400, message: "El ID del registro es requerido.", details: { field: "registroId" } };
	}

	const response = await fetch(`${BASE_URL}/${encodeURIComponent(tabla)}/${encodeURIComponent(registroId)}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Auditoria/estadisticas
 * Obtener estadísticas de auditoría
 */
const getEstadisticas = async (params?: EstadisticasAuditoriaParams): Promise<EstadisticasAuditoriaDto> => {
	console.log("[AuditoriaService] Fetching estadisticas with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);

	const url = queryParams.toString() ? `${BASE_URL}/estadisticas?${queryParams}` : `${BASE_URL}/estadisticas`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

const auditoriaService = {
	getAuditoria,
	getHistorialRegistro,
	getEstadisticas,
};

export default auditoriaService;
