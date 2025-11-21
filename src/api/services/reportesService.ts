/**
 * Servicio de API para reportes y estadísticas
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Reportes
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Reportes";

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

export interface ReporteVentasParams {
	fechaDesde?: string;
	fechaHasta?: string;
	eventoId?: number;
}

export interface ReporteOcupacionParams {
	fechaDesde?: string;
	fechaHasta?: string;
	eventoId?: number;
}

// Los tipos de respuesta dependerán de lo que retorne el backend
// Por ahora usamos 'any' pero deberían definirse según la estructura real
export type ReporteVentasDto = any;
export type ReporteOcupacionDto = any;
export type DashboardDto = any;

// ==================== FUNCIONES ====================

/**
 * GET /api/Reportes/ventas
 * Obtener reporte de ventas con filtros opcionales
 * @param params - Filtros opcionales (fechaDesde, fechaHasta, eventoId)
 */
const getReporteVentas = async (params?: ReporteVentasParams): Promise<ReporteVentasDto> => {
	console.log("[ReportesService] Fetching reporte ventas with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.eventoId !== undefined) queryParams.append("eventoId", String(params.eventoId));

	const url = queryParams.toString() ? `${BASE_URL}/ventas?${queryParams}` : `${BASE_URL}/ventas`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Reportes/ocupacion
 * Obtener reporte de ocupación con filtros opcionales
 * @param params - Filtros opcionales (fechaDesde, fechaHasta, eventoId)
 */
const getReporteOcupacion = async (params?: ReporteOcupacionParams): Promise<ReporteOcupacionDto> => {
	console.log("[ReportesService] Fetching reporte ocupacion with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.eventoId !== undefined) queryParams.append("eventoId", String(params.eventoId));

	const url = queryParams.toString() ? `${BASE_URL}/ocupacion?${queryParams}` : `${BASE_URL}/ocupacion`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Reportes/dashboard
 * Obtener datos del dashboard principal
 */
const getDashboard = async (): Promise<DashboardDto> => {
	console.log("[ReportesService] Fetching dashboard data");

	const response = await fetch(`${BASE_URL}/dashboard`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

const reportesService = {
	getReporteVentas,
	getReporteOcupacion,
	getDashboard,
};

export default reportesService;
