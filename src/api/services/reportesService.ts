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

export interface VentaPorDiaDto {
	fecha: string;
	cantidadBoletos: number;
	totalVenta: number;
}

export interface VentaPorEventoDto {
	eventoId: number;
	eventoNombre: string;
	cantidadBoletos: number;
	totalVenta: number;
}

export interface ReporteVentasDto {
	periodo: {
		desde: string;
		hasta: string;
	};
	totalBoletos: number;
	boletosVendidos: number;
	boletosCancelados: number;
	ingresoTotal: number;
	ingresoBase: number;
	descuentosAplicados: number;
	cargosServicio: number;
	ventasPorEvento: VentaPorEventoDto[];
	ventasPorDia: VentaPorDiaDto[];
}

export interface OcupacionPorViajeDto {
	viajeID: number;
	codigoViaje: string;
	eventoNombre: string;
	rutaNombre: string;
	fechaSalida: string;
	cupoTotal: number;
	asientosVendidos: number;
	asientosDisponibles: number;
	unidadPlacas: string;
	porcentajeOcupacion: number;
}

export interface OcupacionPorEventoDto {
	eventoId: number;
	eventoNombre: string;
	totalViajes: number;
	totalAsientos: number;
	asientosVendidos: number;
	porcentajeOcupacion: number;
}

export interface ReporteOcupacionDto {
	periodo: {
		desde: string;
		hasta: string;
	};
	totalViajes: number;
	viajesCompletos: number;
	promedioOcupacion: number;
	totalAsientosDisponibles: number;
	totalAsientosVendidos: number;
	ocupacionPorViaje: OcupacionPorViajeDto[];
	ocupacionPorEvento: OcupacionPorEventoDto[];
}

export interface DashboardMetricasDto {
	boletosHoy: number;
	boletosMes: number;
	ingresosMes: number;
	viajesProximos: number;
	viajesHoy: number;
	usuariosActivos: number;
	usuariosNuevosMes: number;
	incidenciasAbiertas: number;
	eventosActivos: number;
}

export interface UltimoEventoDto {
	eventoID: number;
	nombre: string;
	fecha: string;
	ciudad: string;
	totalViajes: number;
}

export interface ProximoViajeDto {
	viajeID: number;
	codigoViaje: string;
	eventoNombre: string;
	rutaNombre: string;
	fechaSalida: string;
	asientosVendidos: number;
	cupoTotal: number;
	ocupacion: number;
}

export interface DashboardDto {
	metricas: DashboardMetricasDto;
	ultimosEventos: UltimoEventoDto[];
	proximosViajes: ProximoViajeDto[];
}

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
